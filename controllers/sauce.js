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

exports.likeSauce =(req, res, next) =>{
  if (req.body.like === 1) {
      Sauce.findOne(
          {_id: req.params.id})
            .then((sauce) =>{
                if(!sauce.usersLiked.includes(req.body.userId)){ // Vérification que l'userId est déjà dans le tableau des "like" ou pas
                    Sauce.updateOne(
                        { _id: req.params.id }, 
                        { $push: { usersLiked: req.body.userId }, $inc: { likes: 1 }})
                          .then(() =>
                              res.status(200).json({ message: "J'aime !"}))
                          .catch(error =>
                              res.status(400).json({ error }));
                  }
                else res.status(400).json({ message: "Vous avez déjà aimé cette sauce !"}); // "like" déja enregistré
              })
            .catch(error =>
                res.status(400).json({ error })
        );
    }
  else if (req.body.like === -1) {
      Sauce.findOne({_id: req.params.id})
          .then((sauce) =>{
              if(!sauce.usersDisliked.includes(req.body.userId)){
                  Sauce.updateOne(
                      { _id: req.params.id }, 
                      { $push: { usersDisliked: req.body.userId }, $inc: {dislikes: 1 }})
                        .then(() =>
                            res.status(200).json({ message: "J'aime pas ! "}))
                        .catch(error =>
                            res.status(400).json({ error }));
                  }             
              else res.status(400).json({ message: "Vous avez déjà dit ne pas aimer cette sauce !"}); // "dislike" déja enregistré
              })
          .catch(error =>
              res.status(400).json({ error }));
      
      }
  else if (req.body.like === 0) {
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
              if (sauce.usersLiked.includes(req.body.userId)) {
                  Sauce.updateOne(
                      { _id: req.params.id }, 
                      { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 }})
                        .then(() =>
                            res.status(200).json({ message: "J'aime retiré !" }))
                        .catch(error =>
                            res.status(400).json({ error }));
                  }
              else if (sauce.usersDisliked.includes(req.body.userId)) {
                  Sauce.updateOne(
                      { _id: req.params.id }, 
                      { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 }})
                        .then(() =>
                            res.status(200).json({ message: "J'aime pas retiré !" }))
                        .catch(error =>
                            res.status(400).json({ error }));
                  }
              else res.status(400).json({ message: "Vous avez déjà changé d'avis sur cette sauce !"});
              })
          .catch(error =>
              res.status(404).json({ error }));
      }
  };

  