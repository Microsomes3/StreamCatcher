import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../../../pages/auth/authwatch";
import { app } from "../../../../assets/fb";
import moment from "moment";
import {
    getFirestore,
    getDocs,
    collection,
    addDoc,
    setDoc,
    deleteDoc,
    onSnapshot,
    doc
} from "firebase/firestore";

function Track() {
    const fb = getFirestore(app);

    const [allYoutubers, setAllYoutubers] = useState([]);
    const [youtuberName, setYoutuberName] = useState("");
    const [openAddYoutuber, setOpenAddYoutuber] = useState(false);
    const [editYoutuberId, setEditYoutuberId] = useState(null);
    const [editYoutuberName, setEditYoutuberName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const user = useContext(AuthContext);

    useEffect(() => {
        const userId = user[1];

        const docRef = collection(fb, "users", userId, "youtubers");

        //snapshot


        const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
            const youtubers = [];

            querySnapshot.forEach((doc) => {
                youtubers.push({
                    id: doc.id,
                    name: doc.data().name,
                });
            });

            setAllYoutubers(youtubers);

            setIsLoading(false);

        });



        return unsubscribe;



    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Add logic to track submitted youtuber name

        // check if youtuberName is more then 1 character and contains @ symbol
        if (youtuberName.length > 1 && youtuberName.includes("@")) {
            //collection of user with userid doc and then collection of youtubers inside
            const docRef = collection(fb, "users", user[1], "youtubers");

            //add youtuber name to db
            const doc = await addDoc(docRef, {
                name: youtuberName,
                created: moment().format("YYYY-MM-DD HH:mm:ss"),
            });

            if (doc.id) {
                alert("Youtuber added successfully");
                setOpenAddYoutuber(false);
                setYoutuberName("");
            }
        } else {
            alert("Please enter a valid youtuber name");
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();

        const docRef =doc (fb, "users", user[1], "youtubers", editYoutuberId);

        await setDoc(docRef, {
            name: editYoutuberName,
        });

        const updatedYoutubers = allYoutubers.map((youtuber) =>
            youtuber.id === editYoutuberId
                ? { ...youtuber, name: editYoutuberName }
                : youtuber
        );

        setAllYoutubers(updatedYoutubers);
        setEditYoutuberId(null);
        setEditYoutuberName("");
    };

    const handleDelete = async (id) => {
        const docRef = doc(fb, "users", user[1], "youtubers", id);

        //ask are you sure

        const confirm = window.confirm("Are you sure you want to delete this youtuber?");

        if (!confirm) {
            return;
        }

        await deleteDoc(docRef, id);
        const updatedYoutubers = allYoutubers.filter((youtuber) => youtuber.id !== id);
        setAllYoutubers(updatedYoutubers);
    };

    return (
        <div className="bg-gray-900 text-white   mt-6 rounded-md shadow-2xl">
            
            <div className="container mx-auto py-12 px-4">
                {!openAddYoutuber && (
                    <div
                        onClick={() => setOpenAddYoutuber(true)}
                        className="text-center bg-gray-800 text-white cursor-pointer hover:bg-gray-700 px-4 py-2 rounded-md text-2xl"
                    >
                        Add Youtuber To Track
                    </div>
                )}
                {openAddYoutuber && (
                    <div className="mt-8 flex flex-col">
                        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
                            <div className="flex flex-col">
                                <label htmlFor="youtuberName" className="text-sm">
                                    Youtuber Name:
                                </label>
                                <input
                                    type="text"
                                    id="youtuberName"
                                    value={youtuberName}
                                    onChange={(e) => setYoutuberName(e.target.value)}
                                    placeholder="Youtuber Name @whthekiller"
                                    className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Track Youtuber
                            </button>
                        </form>
                        <button
                            onClick={() => setOpenAddYoutuber(false)}
                            className="text-blue-500 mt-4 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="text-2xl font-bold">Youtubers You Are Tracking</h2>
                    <div className="mt-4 grid grid-cols-4 gap-4">
                        
                    {allYoutubers.map((youtuber) => (
    <div key={youtuber.id} className="bg-gray-800 p-4 rounded-md mb-4">
        {editYoutuberId === youtuber.id ? (
            <form onSubmit={handleEdit} className="space-y-4">
                <div className="flex flex-col">
                    <label htmlFor="editYoutuberName" className="text-sm font-medium text-gray-400 mb-1">
                        Youtuber Name:
                    </label>
                    <input
                        type="text"
                        id="editYoutuberName"
                        value={editYoutuberName}
                        onChange={(e) => setEditYoutuberName(e.target.value)}
                        placeholder="Youtuber Name @whthekiller"
                        className="border border-gray-600 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setEditYoutuberId(null);
                            setEditYoutuberName("");
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        ) : (
            <>
                <p className="text-lg font-bold text-white">{youtuber.name}</p>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => {
                            setEditYoutuberId(youtuber.id);
                            setEditYoutuberName(youtuber.name);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(youtuber.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </>
        )}
    </div>
))}


                       {allYoutubers.length ==0 && <p>No record requests found.</p>}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Track;

