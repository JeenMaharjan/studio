const Video = require("../models/video.js");
const slugify = require("slugify");
const { readFileSync } = require("fs");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");


const awsConfig = {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
    region: process.env.MY_REGION,
    apiVersion: process.env.AWS_API_VERSION,
  };
  
  const S3 = new AWS.S3(awsConfig);

  const create = async (req, res) => {
    const { title, displayVideo } = req.body;
    const slug = slugify(title);

    try {
        // Check if the category already exists
        const existingCategory = await Video.findOne({ slug });

        if (existingCategory) {
            return res.status(400).json({ error: "Category already exists" });
        }

        // If the category doesn't exist, create a new one
        const newCategory = new Video({
            title,
            slug,
            displayVideo,
        });

        
       
        // Save the new category to the database
        await newCategory.save();

        res.status(200).json({ message: "Category created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getCategories = async (req, res) => {
    try {
        const categories = await Video.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Error fetching video categories:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


const postVideo = async (req, res) => {
    try {
        const { slug, bannerImage, video, videoTitle } = req.body;
        
        const videoDoc = await Video.findOne({ slug });

        if (!videoDoc) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Push the data into the project array in vidSchema
        videoDoc.project.push({
            videoTitle,
            video,
            bannerImage,
        });

        // Save the updated document
        await videoDoc.save();

        return res.status(200).json({ message: 'Video data saved successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateVideoCategory = async (req, res) => {
    try {
        const { title, displayVideo } = req.body;
        const { slug } = req.params;

        // Find the video category using the provided slug
        const videoCategory = await Video.findOne({ slug });

        if (!videoCategory) {
            return res.status(404).json({ error: "Video category not found" });
        }

        // Update the title and displayVideo fields
        videoCategory.title = title;
        videoCategory.displayVideo = displayVideo;

        // Update the slug based on the updated title
        videoCategory.slug = slugify(title);

        // Save the updated document
        await videoCategory.save();

        // Send a success response
        return res.json({ message: "Video category updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const videoRemoveCat = async (params) => {
    try {
      
  
      const { Bucket, Key } = params;
      // upload to s3
      S3.deleteObject({ Bucket, Key }, (err, data) => {
        if (err) {
          console.log(err);
          
        }
        // console.log(data); // data.Key
        console.log("video deleted");
      });
    } catch (err) {
      console.log(err);
    }
  };

   const removeImageCat = async (params) => {
    try {
      const { Bucket, Key } = params;
      // image params
      
      // send remove request to s3
      S3.deleteObject({ Bucket, Key }, (err, data) => {
        if (err) {
          console.log(err);
          
        }
        console.log("Image deleted");
      });
    } catch (err) {
      console.log(err);
    }
  };

  const deleteIndividualProject = async (req, res) => {
    const { slug, id } = req.body;
  
    try {
      // Find the video document based on the provided slug
      const video = await Video.findOne({ slug });
  
      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }
  
      // Locate the specific project within the project array using the provided id
      const projectIndex = video.project.findIndex((project) => project._id.toString() === id);
  
      if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      // Extract the bannerImage and video objects to get the S3 keys
      const { bannerImage, video: projectVideo } = video.project[projectIndex];
  
      // Delete associated files from S3
      await removeImageCat({ Bucket: bannerImage.Bucket, Key: bannerImage.Key });
      await videoRemoveCat({ Bucket: projectVideo.Bucket, Key: projectVideo.Key });
  
      // Remove the project from the project array
      video.project.splice(projectIndex, 1);
  
      // Save the updated video document
      await video.save();
  
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  const deleteVideoCategory = async (req, res) => {
    const { id } = req.body;

    try {
        // Find the video document based on the provided _id
        const video = await Video.findOne({ _id: id });

        if (!video) {
            return res.status(404).json({ error: 'Video category not found' });
        }

        // Delete displayVideo from S3
        await videoRemoveCat({ Bucket: video.displayVideo.Bucket, Key: video.displayVideo.Key });

        // Iterate through projects and delete associated files from S3
        for (const project of video.project) {
            await removeImageCat({ Bucket: project.bannerImage.Bucket, Key: project.bannerImage.Key });
            await videoRemoveCat({ Bucket: project.video.Bucket, Key: project.video.Key });
        }

        // Remove the entire project array (deleting all associated files)
        video.project = [];

        // Save the updated video document
        await video.save();

        // Delete the entire video category
        await video.remove();

        res.status(200).json({ message: 'Video category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

  const getSingleVideoCategory = async (req, res) => {
    try {
        const { slug } = req.params;

        // Find the video category using the provided slug
        const videoCategory = await Video.findOne({slug});

        if (!videoCategory) {
            return res.status(404).json({ error: "Video category not found" });
        }

        // Do something with the found video category, e.g., send it in the response
        return res.json(videoCategory);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
module.exports = {
    create , getCategories , postVideo , deleteIndividualProject , getSingleVideoCategory , updateVideoCategory , deleteVideoCategory
  };