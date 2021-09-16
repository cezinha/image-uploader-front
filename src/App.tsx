import React, { DragEvent as ReactDragEvent, useRef, useCallback, useState, useMemo } from 'react';
import { FileDrop } from 'react-file-drop';
import './App.css';
import axios from 'axios';

function App() {
  const API = "http://localhost:5000";
  const [uploaded, setUploaded] = useState(false);
  const [image, setImage] = useState('');
  const copyInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitFile = (files: FileList) => {
    console.log(files);
    let formData = new FormData();
    const file_size = files[0].size;
    formData.append('file', files[0]);
    console.log('>> formData >> ', formData);

    // You should have a server side REST API
    axios.post(`${API}/upload`,
        formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: p => console.log(p.loaded < file_size ? p.loaded / file_size * 100 : 100)
        }
      ).then(function (res) {
        console.log('SUCCESS!!', res);
        if (res.data && res.data.file) {
          setUploaded(true);
          setImage(`${API}${res.data.file}`);
        }
      })
      .catch(function () {
        console.log('FAILURE!!');
      });
  }
  const handleDrop = (files: FileList | null, event: ReactDragEvent<HTMLDivElement>) => {
    console.log('onDrop!', files, event);
    if (files) submitFile(files);
  }
  const onFileInputChange = (files: FileList) => {
    // do something with your files...
    submitFile(files);
  }
  const onTargetClick = useCallback(() => {
    if (fileInputRef && fileInputRef.current)
      fileInputRef.current.click();
  }, [fileInputRef]);
  const imageUrl = useMemo(() => {
    return `url(${image})`;
  }, [image])
  const handleCopy = useCallback(() => {
    if (copyInputRef && copyInputRef.current) {
      copyInputRef.current.select();
      document.execCommand("copy");
    }
  }, [copyInputRef])

  return (
    <div className="App">
      {uploaded && image !== '' ? (
        <div className="Box">
          <h1>Upload successfully!</h1>
          <div className="image-result" style={{
              backgroundImage: imageUrl
            }}>
          </div>
          <input id="input" type="text" value={image} ref={copyInputRef} readOnly />
          <button onClick={handleCopy}>Copy</button>
        </div>
      ) : (
        <div className="Box">
          <h1>Upload your image</h1>
          <p>File should be Jpeg, Png, Svg, ...</p>
          <form>
            <div className="border-file-drop">
              <FileDrop
                onFrameDragEnter={(event) => console.log('onFrameDragEnter', event)}
                onFrameDragLeave={(event) => console.log('onFrameDragLeave', event)}
                onFrameDrop={(event) => console.log('onFrameDrop', event)}
                onDragOver={(event) => console.log('onDragOver', event)}
                onDragLeave={(event) => console.log('onDragLeave', event)}
                onDrop={handleDrop}
                onTargetClick={onTargetClick}
              >
                <p style={{marginTop: 140}}>Drag & Drop your image here or Click here</p>
              </FileDrop>
            </div>
            <input
                onChange={(e) => {
                  if (e.target.files) onFileInputChange(e.target.files);
                }}
                ref={fileInputRef}
                type="file"
                className="hidden"
              />
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
