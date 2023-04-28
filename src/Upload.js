import { useState } from "react";
import axios from "axios";

import { apiKey, apiSecret } from "./constants.js";

function Upload() {
  const [image, setImage] = useState(null);
  //   const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  function handleFileChange(event) {
    const file = event.target.files[0];

    setImage(file);
  }

  function handleSubmit(event) {
    event.preventDefault();

    // console.log(image);

    sendToIPFS(event);
  }

  async function sendToIPFS(event) {
    if (image) {
      const formData = new FormData();
      formData.append("file", image);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: `${apiKey}`,
          pinata_secret_api_key: `${apiSecret}`,
        },
      };

      try {
        const response = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          config
        );
        setFileUrl(response.data.IpfsHash);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("no image");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="image-input">Select an image file:</label>
      <input
        type="file"
        id="image-input"
        accept="image/*"
        onChange={handleFileChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default Upload;
