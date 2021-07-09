const Sauce = require("../models/sauce");
const fs = require("fs"); // Gestion des fichiers système

exports.createSauce = (req, res, next) => { // Création
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  });
    sauce.save()
      .then(() => res.status(201).json({message: "sauce enregistrée!"}))
      .catch(error => res.status(400).json({error}));
};

exports.modifySauce = (req, res, next) => { // Modification
  const sauceObject = req.file ?
  {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
  } : {...req.body};
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
      .then(() => res.status(200).json({message: "sauce modifiée!"}))
      .catch(error  => res.status(400).json({error}));
};

exports.deleteSauce = (req, res, next) => { // Suppression
  Sauce.findOne({_id: req.params.id})
    .then(sauce => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({message: "sauce supprimée!"}))
          .catch(error => res.status(400).json({error}));
      });

    })
    .catch(error => res.status(500).json({error}));
};  

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({error}));
};

exports.getAllSauces = (req, res, next) => {
 
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({error}));
};

exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;

/// Condition SWITCH ------ Evaluation d'une expression
  switch (req.body.like) { 
    case 1: // like
      Sauce.updateOne(
        { _id: req.params.id }, // Récupération de l'id de la sauce
        { $inc: { likes: 1 }, $push: {usersLiked: userId} } // Incrémentation de 1 et rajout de l'id de l'utilisateur
      )
        .then(() => res.status(200).json({message: "J'aime!"}))
        .catch((error) => res.status(400).json({error}));
      break;
    case -1: // dislike
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 }, $push: {usersDisliked: userId} }
      )
        .then(() => res.status(200).json({ message: "J'aime pas!" }))
        .catch((error) => res.status(400).json({error}));
      break;    
    case 0: // Retrait du "like" ou "dislike"
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
          const Liked = sauce.usersLiked;      
          if (Liked.includes(userId)) {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { likes: -1 }, // Décrémentation de 1
                $pull: { usersLiked: userId }, // Retrait de l'id de l'utilisateur
              })
              .then(() => res.status(200).json({ message: "J'aime retiré !" }))
              .catch((error) => res.status(400).json({ error }));
          } else {
            Sauce.updateOne(
              { _id: req.params.id },
              {
                $inc: { dislikes: -1 },
                $pull: { usersDisliked: userId },
              }
            )
              .then(() => res.status(200).json({ message: "J'aime pas retiré !" }))
              .catch((error) => res.status(400).json({ error }));
          }
        })
        .catch((error) => res.status(400).json({ error }));
  }
};

  