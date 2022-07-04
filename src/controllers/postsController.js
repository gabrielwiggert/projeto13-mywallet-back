import { db, objectId } from '../dbStrategy/mongo.js';
import joi from 'joi';

export async function getPosts(req, res) {
  const session = res.locals.session;

  const posts = await db
    .collection('posts')
    .find({ userId: new objectId(session.userId) })
    .toArray();

  res.send(posts);
}

export async function createPost(req, res) {
  const post = req.body;
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');

  const postSchema = joi.object({
    titulo: joi.string().required(),
    post: joi.string().required()
  });

  const { error } = postSchema.validate(post);

  if (error) {
    return res.sendStatus(422);
  }

  const session = await db.collection('sessoes').findOne({ token });

  if (!session) {
    return res.sendStatus(401);
  }

  await db.collection('posts').insertOne({ ...post, userId: session.userId });
  res.status(201).send('Post criado com sucesso');
}
