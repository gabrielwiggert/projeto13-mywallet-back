import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { db } from '../dbStrategy/mongo.js';
import joi from 'joi';

export async function createUser(req, res) {
  const usuario = req.body;

  const usuarioSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = usuarioSchema.validate(usuario);

  if (error) {
    return res.sendStatus(422);
  }

  // Caso tudo esteja validado vamos criptografar os dados antes
  // de entrar no banco de dados.
  const senhaCriptografada = bcrypt.hashSync(usuario.password, 10);

  //Cadastrar de fato os dados no banco com o a senha criptografada.
  await db.collection('usuarios').insertOne({ ...usuario, password: senhaCriptografada });
  res.status(201).send('Usuário criado com sucesso');
}

export async function loginUser(req, res) {
  const usuario = req.body;

  const usuarioSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const { error } = usuarioSchema.validate(usuario);

  if (error) {
    return res.sendStatus(422);
  }

  //Preciso pegar o user pelo email
  const user = await db.collection('usuarios').findOne({ email: usuario.email });

  if (user && bcrypt.compareSync(usuario.password, user.password)) {
    const token = uuid();

    await db.collection('sessoes').insertOne({
      token,
      userId: user._id
    });

    return res.status(201).send({ token });
  } else {
    return res.status(401).send('Senha ou email incorretos!');
  }
}
