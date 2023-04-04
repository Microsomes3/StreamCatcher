import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

function Billing() {

    const [currentSection, setSection] = useState("plans");

    const [selectedPlan, setSelectedPlan] = useState('basic');

    const [isDarkMode, setDarkmode] = useState(true);

    const { section = "plans" } = useParams();

    const faqs = [
      {
        question: 'What is the difference between the plans?',
        answer: "--",
        isOpen: false
      },
      {
        question: 'What does 1 credit get me?',
        answer: "--",
        isOpen: false
      }
    ]

    const [allFaqs, setAllFaqs] = useState(faqs);

    const plans = [
      {
        id: 'basic',
        name: '$5 Basic',
        credits: 100,
        discount: 5,
      },
      {
        id: 'standard',
        name: '$10 Standard',
        credits: 210,
        discount: 10,
      },
      {
        id: 'premium',
        name: '$15 Premium',
        credits: 350,
        discount: 15,
      },
    ];

    const toggleFAQ = (index) => {
      alert(index);
    }

    useEffect(() => {
      setSection(section);
    }, [section]);

    const applySection = (section) => {
      setSection(section);

      window.location.href = `/dashboard/Billing/${section}`;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen">
          <div className="h-3"></div>
          <div className="bg-gray-800 h-12 mx-12 flex items-center justify-around rounded-md">
          <div
              className={`w-full text-center cursor-pointer py-2 ${
                currentSection === "accountbalance" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={() => applySection("accountbalance")}
            >
              Account Balance
            </div>
            <div
              className={`w-full text-center cursor-pointer py-2 ${
                currentSection === "plans" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={() => applySection("plans")}
            >
              Plans
            </div>
            <div
              className={`w-full text-center cursor-pointer py-2 ${
                currentSection === "faq" ? "bg-gray-700" : "hover:bg-gray-700"
              }`}
              onClick={() => applySection("faq")}
            >
              FAQ
            </div>
          </div>
      
        {currentSection == "plans" &&  <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold text-center mb-12">Select Addon</h1>
            <div className="max-w-3xl mx-auto grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-gray-800 p-6 rounded-lg ${
                    selectedPlan === plan.id
                      ? "border-2 border-blue-500"
                      : ""
                  } cursor-pointer`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
                  <p className="text-gray-400 mb-4">
                    {plan.credits} credits ({plan.credits} hours)
                  </p>
                  {plan.discount > 0 && (
                    <p className="text-sm text-gray-500 mb-4">
                      {plan.discount}% discount applied
                    </p>
                  )}
                  <button className="bg-blue-500 text-white py-2 px-4 rounded-full">
                    Buy Addon
                  </button>
                </div>
              ))}
            </div>
          </div>}

         
        {currentSection === "faq" && (
          <div className="grid gap-6 ml-12 mr-12 mt-12">
           
           {allFaqs.map(item=> <div onClick={(e)=> toggleFAQ(item)} className={`bg-${isDarkMode ? 'gray-700' : 'gray-100'} cursor-pointer hover:bg-gray-600 rounded-lg p-6`}>
              <h2 className="text-xl font-semibold">{item.question}</h2>
             
             {item.isOpen && <p className="mb-4">
                You can update your billing information by logging into your account and going to the Billing section.
              </p>}
              
            </div>)}
          
          </div>
        )}


        </div>
      );
      
}

export default Billing;
