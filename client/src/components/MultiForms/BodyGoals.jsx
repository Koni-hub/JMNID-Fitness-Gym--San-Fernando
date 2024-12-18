
import shredded from "../../assets/images/shredded.jpg";
import lean from "../../assets/images/lean.jpg";
import defined from "../../assets/images/defined.jpg";
import bulky from "../../assets/images/bulky.jpg";
import fit from "../../assets/images/fit.jpg";
import { toast } from "react-toastify";

const BODY_GOALS = [
  {
    name: "Shredded",
    description: "Refers to having low body fat with well-defined muscles.",
    image: shredded,
  },
  {
    name: "Lean",
    description:
      "A body type that is low in body fat but not necessarily muscular.",
    image: lean,
  },
  {
    name: "Defined",
    description: "A body with noticeable muscle separation and low body fat.",
    image: defined,
  },
  {
    name: "Bulky",
    description: "A muscular physique with significant muscle mass.",
    image: bulky,
  },
  {
    name: "Fit",
    description:
      "A general term implying a healthy body with good muscle tone and cardiovascular fitness.",
    image: fit,
  },
];

const BodyGoals = ({ onGoalSelect, selectedGoal, onNext }) => {
  const handleSubmit = () => {
    if (!selectedGoal) {
      toast.error("Please select a goal first");
      return;
    }
    onNext();
  };

  return (
    <div className="w-full md:w-[600px] bg-white-light px-6 py-3 rounded-xl m-10">
      <h2 className="text-2xl mb-4">Body Goals</h2>
      <div className="grid grid-cols-2 gap-4">
        {BODY_GOALS.map((goal) => (
          <div
            key={goal.name}
            className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-200 
                ${selectedGoal === goal.name
                ? "border-primary"
                : "border-gray-300"
              }`}
            onClick={() => onGoalSelect(goal.name)}
          >
            <img
              src={goal.image}
              alt={goal.name}
              className="w-12 h-12 rounded-full mb-2"
            />
            <h3 className="text-lg font-semibold">{goal.name}</h3>
            <p className="text-sm text-gray-600">{goal.description}</p>
          </div>
        ))}
      </div>
      {selectedGoal && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Selected Goal:</h3>
          <p>{selectedGoal}</p>
        </div>
      )}
      <button
        className="w-full bg-primary px-4 py-2 text-white mt-4"
        onClick={handleSubmit}
      >
        NEXT
      </button>
    </div>
  );
};

export default BodyGoals;
