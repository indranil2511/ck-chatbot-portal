import React from "react";
import ReactLoading from "react-loading";
import './LoadingComponent.css';
function LoadingComponent() {
    return (
        <div className="center">
        <ReactLoading type={"bubbles"} color={"#7dbb91"} />
        </div>
    );
}

export default LoadingComponent;