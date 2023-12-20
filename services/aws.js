const { S3Client, DeleteObjectCommand , } = require("@aws-sdk/client-s3");
const {Upload} = require('@aws-sdk/lib-storage');



/// NOTE THE ALLOWED OPERATIONS FOR THE S3 CLIENT IS DELETE AND UPLOAD ONLY
/// FILE KEY IS THE NAME OF THE FILE -- key is the name of the file in the bucket -- حنيكه


// AWS config
const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  

});

exports.uploadFile = async (fileKey , fileBody , fileType) =>{

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: fileBody,
      ContentType: fileType,
    },
  });

  let data = await upload.done()
  return data.Location
  
}

exports.deleteFile = async (fileKey) => {

  const deleteObject = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  });

  let data = await s3.send(deleteObject)
  return data.DeleteMarker
  
}