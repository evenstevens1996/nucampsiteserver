const express = require('express');
const favoriteRouter = express.Router();
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');
favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {

    Favorite.find({user: req.user._id })
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite) {
                req.body.forEach(campsite => {
                    if (!favorite.campsites.includes(campsite._id)) {
                    favorite.campsites.push(campsite._id);
                    }
            });
            } else {
                favorite = new Favorite({
                    user: req.user._id,
                    campsites: req.body.map(campsite => campsite._id)
            });
            }
        favorite.save()
            .then(favorite => res.json(favorite))
            .catch(err => next(err))
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id })
    .then(favorite => {
        if(favorite) {
            res.json(favorite);
        } else {
            res.send('You do not have a favorite to delete');
            res.setHeader('Content-Type', 'application/json');
        }
    })
    .catch(err => next(err));
});
favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`GET  operation not supported`);

    })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (!favorite) {
                favorite = new Favorite({
                    user: req.user._id,
                    campsites: [req.params.campsiteId]
                })
            }
                else if (favorite.campsites.includes(req.params.campsiteId)) {
                    res.send('That campsite is already in the list of favorites!');
                    return
                }
            favorite.campsites.push(req.params.campsiteId)
            favorite.save()
                .then(favorite => res.json(favorite))
                .catch(err => next(err));

        })
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
        res.end(`PUT  operation not supported`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if(!favorite) {
            res.send('No favorites to delete.');
            return;
        } 
        let campsites = favorite.campsites.filter(campsite => campsite.toString() !== req.params.campsiteId);

        favorite.campsites= campsites;

        favorite.campsite = campsites;
        favorite.save()
        .then(favorite => res.json(favorite))
        .catch(err => next(err)); 
    })
    .catch(err => next(err));
});