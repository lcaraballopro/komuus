import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import ModalImage from "react-modal-image";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},
}));

const ModalImageCors = ({ imageUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");

	useEffect(() => {
		if (!imageUrl) return;
		const fetchImage = async () => {
			// Construct the full URL for public images
			const fullUrl = imageUrl.startsWith("http")
				? imageUrl
				: `/public/${imageUrl}`;

			try {
				const response = await fetch(fullUrl);
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				setBlobUrl(url);
				setFetching(false);
			} catch (error) {
				console.error("Error fetching image:", error);
				setFetching(false);
			}
		};
		fetchImage();
	}, [imageUrl]);

	return (
		<ModalImage
			className={classes.messageMedia}
			smallSrcSet={fetching ? imageUrl : blobUrl}
			medium={fetching ? imageUrl : blobUrl}
			large={fetching ? imageUrl : blobUrl}
			alt="image"
		/>
	);
};

export default ModalImageCors;

