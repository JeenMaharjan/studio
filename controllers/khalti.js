const axios = require("axios")


const khaltiPayment = async (req, res) => {
    try {
        const payload = req.body;
        
        const khaltiResponse = await axios.post(
          "https://a.khalti.com/api/v2/epayment/initiate/",
          payload,
          {
            headers: {
              Authorization: process.env.KHALTI_KEY,
             
            },
          }
        );
        console.log(khaltiResponse.data);
        res.status(200).json(khaltiResponse.data);
      } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).json({
          error: "Internal Server Error",
        });
      }
}

module.exports = {
    khaltiPayment
  };