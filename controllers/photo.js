const Photo = require("../models/photo.js");
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
    try {
        const { title } = req.body;

        // Create a slug from the title
        const slug = slugify(title);

        // Create a new photo object
        const newPhoto = new Photo({
            title,
            slug,
        });

        // Save the photo to the database
        const savedPhoto = await newPhoto.save();

        res.status(201).json(savedPhoto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getCategories = async (req, res) => {
    try {
        // Find all documents in the Photo collection
        const categories = await Photo.find({}, 'title slug');

        // Extract titles and slugs from the retrieved documents
        

        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const uploadBannerPhoto = async (req, res) => {
    try {
        const { files } = req;
        
        
        if (!files || Object.keys(files).length === 0) {
          return res.status(400).send("No files provided.");
        }
    
        const uploadedImages = [];
    
        const uploadPromises = Object.values(files).map(async (file, index) => {
          // Read the file content as a Buffer
          const fileContent = readFileSync(file.path);
        
          const type = file.type.split("/")[1];
        
          const params = {
            Bucket: "edemy-buckety", // Replace with your S3 bucket name
            Key: `studio/${nanoid()}.${type}`,
            Body: fileContent, // Use file content directly as Body
            ACL: "public-read",
            ContentType: `image/${type}`,
          };
        
          return new Promise((resolve, reject) => {
            S3.upload(params, (err, data) => {
              if (err) {
                console.error(err);
                reject(err);
              } else {
                uploadedImages.push(data);
                resolve();
              }
            });
          });
        });
        
        await Promise.all(uploadPromises);
        console.log(uploadedImages)
        res.status(200).json({ images: uploadedImages });
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
}

const saveBannerPhoto = async (req, res) => {
    try {
        const { bannerImage, slug } = req.body;
        console.log(bannerImage)
        // Find the photo by slug
        const photo = await Photo.findOne({ slug });
        
        if (!photo) {
            return res.status(404).json({ error: 'Photo not found' });
        }

        if (!Array.isArray(photo.project)) {
          photo.project = [{}];
      } else if (photo.project.length === 0) {
          photo.project.push({});
      }
      
        // Check if there's an existing bannerImage
        if (photo.project[0]?.bannerImage) {
            // Extract the key of the existing bannerImage
            const existingBannerImageKey = photo.project[0].bannerImage.Key;

            // Delete the existing bannerImage from S3
            const deleteParams = {
                Bucket: bannerImage.Bucket,
                Key: existingBannerImageKey,
            };

            S3.deleteObject(deleteParams, (err, data) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ error: 'Failed to delete existing bannerImage from S3' });
                }
                console.log('Existing bannerImage deleted from S3');
            });
        }

        // Update the bannerImage field
        photo.project[0].bannerImage = {
            Key: bannerImage.Key,
            Location: bannerImage.Location,
            Bucket: bannerImage.Bucket,
            ETag: bannerImage.ETag,
            ServerSideEncryption: bannerImage.ServerSideEncryption,
            key: bannerImage.key,
            // Add other properties as needed
        };

        // Save the updated photo
        await photo.save();

        res.status(200).json({ message: 'Banner image saved successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const saveLandscapePhoto = async (req, res) => {
  try {
    const { landscapeImages, slug } = req.body;

    // Find the photo based on the provided slug
    const photo = await Photo.findOne({ slug });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Push the new landscape images to the existing array
    photo.project[0].landscapeImages.push(...landscapeImages);

    // Save the updated photo
    const updatedPhoto = await photo.save();

    return res.json(updatedPhoto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const savePhoto = async (req, res) => {
  try {
    const { images, slug } = req.body;
    
    // Find the photo based on the provided slug
    const photo = await Photo.findOne({ slug });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Push the new landscape images to the existing array
    photo.project[0].images.push(...images);

    // Save the updated photo
    const updatedPhoto = await photo.save();

    return res.json(updatedPhoto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const getAllPhotos = async (req, res) => {
  try {
    const allPhotos = await Photo.find({});
    res.json(allPhotos);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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

const deleteSingleLandscape = async (req, res) => {
  const { slug, landscapeImages } = req.body;

  try {
    // Find the photo document based on the provided slug
    const photo = await Photo.findOne({ slug });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if photo.project.landscapeImages is an array
    if (!Array.isArray(photo.project[0]?.landscapeImages)) {
      return res.status(404).json({ error: 'Landscape images not found in the photo project' });
    }

    // Find the index of the landscape image in the landscapeImages array
    const landscapeIndex = photo.project[0].landscapeImages.findIndex(
      (image) => image.key === landscapeImages.key
    );

    if (landscapeIndex === -1) {
      return res.status(404).json({ error: 'Landscape image not found' });
    }

    // Extract the S3 key for the landscape image
    const { Key, Bucket } = landscapeImages;

    // Delete the landscape image from S3
    await removeImageCat({ Bucket, Key });

    // Remove the landscape image from the landscapeImages array
    photo.project[0].landscapeImages.splice(landscapeIndex, 1);

    // Save the updated photo document
    await photo.save();

    res.status(200).json({ message: 'Landscape image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSinglePhotos = async (req, res) => {
  try {
      const { slug } = req.params;

      // Find the photo by slug
      const photo = await Photo.findOne({ slug });

      if (!photo) {
          return res.status(404).json({ error: 'Photo not found' });
      }

      // Handle the case where the photo is found
      res.json(photo);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = {
    create , getCategories , uploadBannerPhoto , saveBannerPhoto , saveLandscapePhoto, savePhoto , 
    getAllPhotos , getSinglePhotos , deleteSingleLandscape
  };