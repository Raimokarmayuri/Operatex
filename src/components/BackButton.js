import { ArrowLeftIcon } from "@heroicons/react/24/outline";  // Heroicons back arrow icon
import { useNavigate } from "react-router-dom";
import React from "react";

const BackButtonHeroicons = () => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate("/user")} 
      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#034694" }} 
      aria-label="Back to user page"
    >
      <ArrowLeftIcon style={{ width: "2.5em", height: "2.5em", marginBottom:"1rem", marginTop:"3rem", marginLeft:"1.5rem" }} />
    </button>
  );
};

export default BackButtonHeroicons;
