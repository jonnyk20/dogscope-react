import React, { useState, useRef } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css";

const STATES = {
  INITIAL: "INITIAL",
  MODEL_LOADING: "MODEL_LOADING",
  MODEL_LOADED: "MODEL_LOADED",
  IMAGE_UPLOADED: "IMAGE_UPLOADED",
  IDENTIFYING: "IDENTIFYING",
  COMPLETE: "COMPLETE"
};

function App() {
  const [state, setState] = useState(STATES.INITIAL);
  const [results, setResults] = useState([]);
  const [imageURL, setImageURL] = useState(null);
  const [model, setModel] = useState(null);
  const imageRef = useRef();

  const loadModel = async () => {
    setState(STATES.MODEL_LOADING);
    const model = await mobilenet.load();
    setModel(model);
    setState(STATES.MODEL_LOADED);
  };

  const identify = async () => {
    setState(STATES.IDENTIFYING);
    const results = await model.classify(imageRef.current);
    setResults(results);
    setState(STATES.COMPLETE);
  };

  const reset = async () => {
    setState(STATES.MODEL_LOADED);
    setResults([]);
  };

  const handleUpload = event => {
    const { files } = event.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(event.target.files[0]);
      setImageURL(url);
    }
    setState(STATES.IMAGE_UPLOADED);
  };

  let prompt = null;

  switch (state) {
    case STATES.INITIAL:
      prompt = <button onClick={loadModel}>Load Model</button>;
      break;
    case STATES.MODEL_LOADING:
      prompt = <div className="progress">Loading...</div>;
      break;
    case STATES.MODEL_LOADED:
      prompt = (
        <label>
          <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={handleUpload}
          />
          upload photo
        </label>
      );
      break;
    case STATES.IMAGE_UPLOADED:
      prompt = <button onClick={identify}>Identify</button>;
      break;
    case STATES.IDENTIFYING:
      prompt = <div className="progress">Identifying...</div>;
      break;
    case STATES.COMPLETE:
      prompt = (
        <button id="reset" onClick={reset}>
          Reset
        </button>
      );
      break;
    default:
      prompt = null;
      break;
  }

  const previewVisible =
    state === STATES.IMAGE_UPLOADED || state === STATES.COMPLETE;

  return (
    <div id="container">
      {previewVisible && (
        <img src={imageURL} alt="upload-preview" ref={imageRef} />
      )}
      {results.length > 0 && (
        <ul id="results">
          {results.map(({ className, probability }) => (
            <li key={className}>{`${className}: %${(probability * 100).toFixed(
              2
            )}`}</li>
          ))}
        </ul>
      )}
      {prompt}
    </div>
  );
}

export default App;
