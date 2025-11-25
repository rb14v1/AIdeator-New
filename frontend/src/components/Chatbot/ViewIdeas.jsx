import React from "react";
import { Link } from "react-router-dom";
 
const ViewIdeas = () => {
  return (
    <Link
      to="/all-ideas"
      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium
      shadow-md hover:bg-teal-700 transition duration-200"
    >
      All Ideas
    </Link>
  );
};
 
export default ViewIdeas;