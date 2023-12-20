<h1> DocTalker Web Application</h1>
<br>
<h2> How to use it guide :</h2>
<hr>
<h2> -- upload/upload ---> to upload a file (.pdf for now) to AWS s3 and retrieve its location and save it to mongo db</h2>
<h4> Here u have to only pass the file (like form Postman -- the key must be file) -- or form a form field (field name must be: 'file')</h4>
<br>
<h2> -- upload/process ---> to extract the text from the doc (from AWS s3) process it and make them chunks then get their embeddings and save it pinecone db and get vectorIndex of it to save it in mongo db</h2>
<h4> Here u have to only pass the file's id </h4>
<br>
<h2> -- query/query-process ---> extract the query from the user and get its embedding to perform a similarity search according to the embedded chunks and give the topk2 to openai with the query and receive the response </h2>
<h4> Here u have to only pass the file's id </h4>
<br>
