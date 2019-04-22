import React, { Fragment, useState } from 'react';
import axios from 'axios';

import Message from './Message';
import ProgressBar from './Progress';

const FileUpload = () => {
	const [file, setFile] = useState('');
	const [filename, setFilename] = useState('Choose File');
	const [uploadedFile, setUploadedFile] = useState({});
	const [message, setMessage] = useState('');
	const [uploadPercentage, setUploadPercentage] = useState(0);

	const onChange = (e) => {
		// HTML file upload comes as an array of file, 
		// since this is single file upload we are selecting the first one
		const file = e.target.files[0];
		if(file){
			setFile(file);
			setFilename(file.name);
		}
	};

	const onSubmit = async (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await axios.post('/uploads', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				onUploadProgress: progressEvent => {
					setUploadPercentage(parseInt(Math.round(progressEvent.loaded * 100) / progressEvent.total));
				
					// Clear percentage after 10 seconds
					setTimeout(()=> setUploadPercentage(0), 10000);
				}

			});
			
			const {fileName, filePath} = res.data;

			setUploadedFile({fileName, filePath})
			setMessage("File uploaded.");
		} catch (err){
			if(err.response.status === 500){
				setMessage('There was a problem with the server');
			} else {
				setMessage(err.response.data.msg);
			}
		}
	}
	return (
		<Fragment>
			{message && <Message msg={message} />}
			<form onSubmit={onSubmit}>
				<div className="custom-file mb-4">
					<input id="customFile" className="custom-file-input" type="file" onChange={onChange}/>
					<label className="custom-file-label" htmlFor="customFile">{filename}</label>

					<ProgressBar percentage={uploadPercentage} />
					
					<input className="btn btn-primary btn-block mt-4" type="submit" value="Upload"/>
				</div>
			</form>

			{uploadedFile && 
				<div className="row mt-5">
					<div className="col-md-6 m-auto">
						<h3 className="text-center">{uploadedFile.fileName}</h3>
						<img className="uploaded-image" src={uploadedFile.filePath} alt={uploadedFile.fileName}/>
					</div>
				</div>
			}
		</Fragment>
	)
}

export default FileUpload;