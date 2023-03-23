import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

function AddYoutuber() {

  const [username, setUsername] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Submitted username:', username);
    // do something with the username

    //check if username starts with @
    if (username.charAt(0) !== '@') {
        alert('Username must start with @');
        return;
    }else{

        axios.post("https://54ttpoac10.execute-api.us-east-1.amazonaws.com/dev/addYoutuberUsername",{
            username: username
        }).then((data)=>{
            console.log(data);
            alert('Youtuber added successfully, it may take a few minutes to show up');
            setUsername('');
        }).catch((err)=>{
            console.log(err);
            alert('Error adding youtuber');
        })
    }

  };

  return (
    <div className="bg-black h-screen">
      <div className="h-12 flex items-center justify-center bg-white">
        <p className="font-bold">Add Youtuber to be tracked</p>
      </div>
      <div className="flex justify-center mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col items-center bg-gray-800 p-8 rounded-lg">
  <label htmlFor="username" className="text-white font-bold mb-2">
    Enter a YouTube username:
  </label>
  <div className="flex items-center">
    <input
      type="text"
      id="username"
      name="username"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
      className="border border-gray-500 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
      placeholder="@PewDiePie"
      required
    />
  </div>
  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
  >
    Submit
  </button>
</form>

      </div>
      <div className="flex justify-center mt-8">
        <Link to="/" className="text-white underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default AddYoutuber;
