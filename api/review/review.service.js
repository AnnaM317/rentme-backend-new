const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('review');
    // const reviews = await collection.find(criteria).toArray()
    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            from: 'user',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $lookup: {
            from: 'toy',
            localField: 'toyId',
            foreignField: '_id',
            as: 'toy',
          },
        },
        {
          $unwind: '$toy',
        },
      ])
      .toArray();
    reviews = reviews.map((review) => {
      review.user = {
        _id: review.user._id,
        username: review.user.username,
      };
      review.toy = {
        _id: review.toy._id,
        name: review.toy.name,
        price: review.toy.price,
      };
      delete review.userId;
      delete review.toyId;
      return review;
    });
    return reviews;
  } catch (err) {
    logger.error('cannot find reviews', err);
    throw err;
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore();
    const { userId, isAdmin } = store;
    const collection = await dbService.getCollection('review');
    // remove only if user is owner/admin
    const query = { _id: ObjectId(reviewId) };
    if (!isAdmin) query.userId = ObjectId(userId);
    const res = await collection.deleteOne(query);
    if (res.deletedCount === 0) {
      throw new Error('cant remove review');
    }
    // return await collection.deleteOne({ _id: ObjectId(reviewId), byUserId: ObjectId(userId) })
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err);
    throw err;
  }
}


async function add(review) {
  try {
    console.log('review backend service', review);
    // peek only updatable fields!
    const reviewToAdd = {
      userId: ObjectId(review.userId),
      toyId: ObjectId(review.toyId),
      content: review.content,
      rate: review.rate,
    };
    const collection = await dbService.getCollection('review');
    await collection.insertOne(reviewToAdd);
    return reviewToAdd;
  } catch (err) {
    logger.error('cannot insert review', err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  var criteria;
  if (filterBy.toyId) {
    criteria = { toyId: ObjectId(filterBy.toyId) };
  } else if (filterBy.userId) {
    criteria = { userId: ObjectId(filterBy.userId) };
  } else {
    criteria = {};
  }
  // const criteria = {}
  console.log(criteria);
  return criteria;
}

module.exports = {
  query,
  remove,
  add
}


