const Category = require("../models/category.js");
const slugify = require("slugify");
const AWS = require("aws-sdk");
const fs = require("fs");
const { nanoid } = require("nanoid");
const { readFileSync } = require("fs");

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
        const slug = slugify(title)
        // return console.log(title , slug)

        // Check if the category with the same slug already exists
        const existingCategory = await Category.findOne({ slug });

        if (existingCategory) {
            return res.status(400).json({ error: "Category with this title already exists." });
        }

        // Create a new category
        const category = new Category({ title, slug });

        // Save the category to the database
        await category.save();

        res.status(201).json({ message: "Category created successfully", category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};


 const getAllCategory = async (req, res) => {
    try {
        // Retrieve all categories from the database
        const categories = await Category.find();

        // Send the categories as a response
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

 const uploadImage = async (req, res) => {
  try {
    const { files} = req; // Extract slug from req.body
    const {slug} = req.params



    if (!files || Object.keys(files).length === 0) {
      return res.status(400).send("No files provided.");
    }

    const uploadedImages = [];

    const uploadPromises = Object.values(files).map(async (file, index) => {
      // Read the file content as a Buffer
      const fileContent = readFileSync(file.path);
    
      const type = file.type.split("/")[1];
    
      const params = {
        Bucket: "edemy-bucketyy", // Replace with your S3 bucket name
        Key: `studio/images/${slug}/${nanoid()}.${type}`,
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

    res.status(200).json({ images: uploadedImages });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
   const removeImage = async (req, res) => {
    try {
      const { image } = req.body;
      // image params
      const params = {
        Bucket: image.Bucket,
        Key: image.Key,
      };
  
      // send remove request to s3
      S3.deleteObject(params, (err, data) => {
        if (err) {
          console.log(err);
          res.sendStatus(400);
        }
        res.send({ ok: true });
      });
    } catch (err) {
      console.log(err);
    }
  };

   const videoUpload = async (req, res) => {
    try {
    
      const { video } = req.files;
      const {slug} = req.params
      if (!video) return res.status(400).send("No video");
      const fileStream = fs.createReadStream(video.path);
      // image params
      const params = {
        Bucket: "edemy-bucketyy",
        Key: `studio/video/${slug}/${nanoid()}.${video.type.split("/")[1]}`,
        Body: fileStream,
        ACL: "public-read",
        ContentType: video.type,
      };
  
      // upload to s3
      S3.upload(params, (err, data) => {
        if (err) {
          console.log(err);
          res.sendStatus(400);
        }
        // console.log(data); // data.Key
        res.send(data);
      });
    } catch (err) {
      console.log(err);
    }
  };
  
   const videoRemove = async (req, res) => {
    try {
      
  
      const { Bucket, Key } = req.body;
      // upload to s3
      S3.deleteObject({ Bucket, Key }, (err, data) => {
        if (err) {
          console.log(err);
          res.sendStatus(400);
        }
        // console.log(data); // data.Key
        res.send({ ok: true });
      });
    } catch (err) {
      console.log(err);
    }
  };

 
    
   const addProject = async (req, res) => {
    const { name, desc, status, location, video, images } = req.body;
    const categoryId = req.params.id;
    const slug = slugify(name);
  
    try {
      // Find the category by ID
      const category = await Category.findById(categoryId);
  
      // If the category is not found, return an error response
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // Create a new project object
      const newProject = {
        name,
        slug,
        desc,
        status,
        location,
        video,
        images,
      };
  
      // Add the new project to the category's project array
      category.project.push(newProject);
  
      // Save the updated category
      const updatedCategory = await category.save();
  
      // Optionally, you can return the updated category in the response
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error adding project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

   const categoryWithProject = async (req, res) => {
    try {
      const categoriesWithProjects = await Category.aggregate([
        {
          $match: {
            "project.0": { $exists: true }, // Match categories with at least one project
          },
        },
      ]);
  
      res.json(categoriesWithProjects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };


   const updateProject = async (req, res) => {
    const { id, slug } = req.params;
    const { name, desc, status, location, video, images } = req.body;
    
  
    try {
      // Find the category by ID
      const category = await Category.findById(id);
  
      // If the category is not found, return an error response
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      // Find the project in the category's project array by slug
      const projectIndex = category.project.findIndex((project) => project.slug === slug);
  
      // If the project is not found, return an error response
      if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found in the category' });
      }
  
      // Update the project with the new values
      category.project[projectIndex].name = name;
      category.project[projectIndex].slug = slugify(name); // Update slug to the new title
      category.project[projectIndex].desc = desc;
      category.project[projectIndex].status = status;
      category.project[projectIndex].location = location;
      category.project[projectIndex].video = video;
      category.project[projectIndex].images = images;
  
      // Save the updated category
      const updatedCategory = await category.save();
  
      // Optionally, you can return the updated category in the response
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

   const getProject = async (req, res) => {
    try {
      const { slug } = req.params;
  
      // Find the project based on the provided slug
      const category = await Category.findOne({
        'project.slug': slug,
      });
  
      if (!category) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      // Extract the category information
      
  
      // You can now use 'category' in your response or further processing
      res.json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

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
  


   const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Find the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Remove associated videos from AWS
    if (category.project && category.project.length > 0) {
      for (const project of category.project) {
        if (project.video) {
          await videoRemoveCat({ Bucket: project.video.Bucket, Key: project.video.Key });
        }
      }
    }

    // Remove associated images from AWS
    if (category.project && category.project.length > 0) {
      for (const project of category.project) {
        if (project.images && project.images.length > 0) {
          for (const image of project.images) {
            await removeImageCat({ Bucket: image.Bucket, Key: image.Key });
          }
        }
      }
    }

    // Remove the category from the database
    await Category.findByIdAndRemove(categoryId);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


 const deleteProject = async (req, res) => {
  try {
    const categoryId = req.params.catid;
    const projectId = req.params.projectid;

    // Find the category by ID
    const category = await Category.findById(categoryId);

    // Check if the category exists
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Remove associated videos from AWS
    if (category.project && category.project.length > 0) {
      for (const project of category.project) {
        if (project.video) {
          await videoRemoveCat({ Bucket: project.video.Bucket, Key: project.video.Key });
        }
      }
    }

    // Remove associated images from AWS
    if (category.project && category.project.length > 0) {
      for (const project of category.project) {
        if (project.images && project.images.length > 0) {
          for (const image of project.images) {
            await removeImageCat({ Bucket: image.Bucket, Key: image.Key });
          }
        }
      }
    }

    // Find the category by ID and pull the project with the given ID
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $pull: { 'project': { _id: projectId } } },
      { new: true }
    );

    // Check if the category was not found after the update
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Return the updated category
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  create, getAllCategory, uploadImage, removeImage, 
  videoUpload, videoRemove, addProject, categoryWithProject, getProject, updateProject, 
  deleteCategory, deleteProject // <-- make sure to include this
};