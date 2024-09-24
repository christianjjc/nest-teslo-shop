export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
  //   console.log({ file });
  if (!file) return callback(new Error('File is Empty'), false);

  const fileExtension = file.mimetype.split('/')[1];

  const fileName = `HolaMundo.${fileExtension}`;

  callback(null, fileName);
};
