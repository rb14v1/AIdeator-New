import React from 'react';
import { Link } from 'react-router-dom';

const ViewIdeas = () => {
  return (
    <div>
      <Link
        to="/all-ideas"
        className="absolute top-4 left-4 px-1 py-2 bg-teal-600 text-white rounded-md shadow hover:bg-teal-700"
      >
        All Ideas
      </Link>
    </div>
  );
};

export default ViewIdeas;
