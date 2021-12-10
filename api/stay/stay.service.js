// const fs = require('fs')
const dbService = require('../../services/db.service.js');
const ObjectId = require('mongodb').ObjectId;
const logger = require('../../services/logger.service.js');
const asyncLocalStorage = require('../../services/als.service');

// const gToys = require('../data/toys.json')

module.exports = {
  query,
  getById,
  remove,
  add,
  update,
};
// { filterBy = { priceRange: '[0, 850]', propertyType: '[]', amenities: '[]', city: '', totalGuests: 1 } }
//filterBy = {priceRange: '[0, 850]', propertyType: '[]', amenities: '[]', city: '', guests: 1}
async function query(filterBy) {
  console.log('service back query filterBy', filterBy);
  try {
    const criteria = _buildCriteria(filterBy);
    // const criteria = {}

    const collection = await dbService.getCollection('stay');
    // console.log('collection', collection);
    const stays = await collection.find(criteria).toArray();
    // console.log('stays', stays)

    // var reviews = await collection.aggregate([
    //     {
    //         $match: criteria
    //     },
    //     {
    //         $lookup:
    //         {
    //             localField: 'byUserId',
    //             from: 'user',
    //             foreignField: '_id',
    //             as: 'byUser'
    //         }
    //     },
    //     {
    //         $unwind: '$byUser'
    //     },
    //     {
    //         $lookup:
    //         {
    //             localField: 'aboutUserId',
    //             from: 'user',
    //             foreignField: '_id',
    //             as: 'aboutUser'
    //         }
    //     },
    //     {
    //         $unwind: '$aboutUser'
    //     }
    // ]).toArray()
    // reviews = reviews.map(review => {
    //     review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
    //     review.aboutUser = { _id: review.aboutUser._id, fullname: review.aboutUser.fullname }
    //     delete review.byUserId
    //     delete review.aboutUserId
    //     return review
    // })

    return stays;
  } catch (err) {
    logger.error('cannot find stays', err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  console.log('filterBy', filterBy);
  const criteria = {};
  const criterias = [];
  if (filterBy.propertyType && filterBy.propertyType.length) {
    criteria.type = { $in: filterBy.propertyType };
  }
  // filterBy.priceRange[0]
  if (filterBy.priceRange && filterBy.priceRange.length) {
    criteria.price = {
      $gte: +filterBy.priceRange[0],
      $lte: +filterBy.priceRange[1],
    };
  }
  if (filterBy.amenities && filterBy.amenities.length) {
    // criteria['amenities'] = { $all: filterBy.amenities }
    criteria.amenities = { $all: filterBy.labels };
  }
  // if (filterBy.labels !== 'all') {
  //     const label = { label: { $regex: filterBy.labels, $options: 'i' } };
  //     criterias.push(label);
  //  }
  // criteria = criterias.length === 0 ? {} : { $and: criterias };
  if (filterBy.city) {
    const cityCriteria = { $regex: filterBy.city, $options: 'i' };
    criteria['loc.address'] = cityCriteria;
  }
  // const txtCriteria = { $regex: filterBy.city, $options: 'i' };
  // if (filterBy.city && filterBy.city !== '') {
  // if (filterBy.city === 'flexible') {
  //     stay.loc.city === 'Bora Bora' ||
  //         stay.loc.city === 'Hawaii' ||
  //         stay.loc.city === 'France'
  // }
  // else {
  // criteria = { 'loc.address': txtCriteria };
  // }
  // }
  if (filterBy.totalGuests) {
    criteria.capacity = { $gte: +filterBy.totalGuests };
  }

  console.log('criteria', criteria);
  return criteria;
}
// return criteria
// if (filterBy.name) {
//     const txtCriteria = { $regex: filterBy.name, $options: 'i' }
//     criteria.name = txtCriteria
// }
// if (filterBy.inStock !== '') {
//     criteria.inStock = { $eq: JSON.parse(filterBy.inStock) }
// }
// if (filterBy.labels) {
//     if (filterBy.labels.length) {
//         criteria.labels = { $in: filterBy.labels }
//     }
// }
// console.log('criteria:', criteria);
// return criteria

// function _buildCriteria(filterBy) {
//     var criteria;
//     var criterias = [];
//     if (filterBy.name !== '') {
//         const name = { name: { $regex: filterBy.name, $options: 'i' } };
//         criterias.push(name);
//     }
//     if (filterBy.inStock !== 'all') {
//         var inStock;
//         if (filterBy.inStock === 'true') {
//             inStock = { inStock: Boolean(filterBy.inStock) };
//         } else {
//             inStock = { inStock: Boolean(0) };
//         }
//         criterias.push(inStock);
//     }
//     if (filterBy.labels !== 'all') {
//         const label = { label: { $regex: filterBy.labels, $options: 'i' } };
//         criterias.push(label);
//     }
//     criteria = criterias.length === 0 ? {} : { $and: criterias };
//     console.log('criteria', criteria);
//     return criteria;
// }

async function getById(stayId) {
  try {
    const collection = await dbService.getCollection('stay');
    const stay = collection.findOne({ _id: ObjectId(stayId) });
    return stay;
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err);
    throw err;
  }
}

async function remove(stayId) {
  try {
    const collection = await dbService.getCollection('stay');
    await collection.deleteOne({ _id: ObjectId(stayId) });

    // const store = asyncLocalStorage.getStore()
    // const { userId, isAdmin } = store
    // const collection = await dbService.getCollection('toy')
    // // remove only if user is owner/admin
    // const criteria = { _id: ObjectId(reviewId) }
    // if (!isAdmin) criteria.byUserId = ObjectId(userId)
    // await collection.deleteOne(criteria)
    // return toyId
  } catch (err) {
    logger.error(`cannot remove stay ${stayId}`, err);
    throw err;
  }
}
async function add(stay) {
  try {
    const stayToAdd = {
      name: stay.name,
      price: stay.price,
      host: stay.host,
      summary: stay.summary || '',
      imgUrls: stay.imgUrls,
      type: stay.type || 'Entire rental unit',
      capacity: stay.capacity || 2,
      amenities: stay.amenities || [],
      loc: stay.loc,
      reviews: stay.reviews || [],
    };
    // console.log('stay before', stay);
    const collection = await dbService.getCollection('stay');
    await collection.insertOne(stayToAdd);
    // console.log('stay after', stay);
    return stayToAdd;
  } catch (err) {
    logger.error('Cannot insert stay', err);
    throw err;
  }
}
async function update(stay) {
  try {
    var id = ObjectId(stay._id);
    //?
    delete stay._id;
    const collection = await dbService.getCollection('stay');
    await collection.updateOne({ _id: id }, { $set: { ...stay } });
    return stay;
  } catch (err) {
    logger.error(`Cannot update stay ${stay._id}`, err);
    throw err;
  }
}
////1) need to add stays that user liked
////2)stays that a host have

// function save(toy) {
//     if (toy._id) {
//         const idx = gToys.findIndex(currToy => currToy._id === toy._id)
//         // const dbToy = gToys[idx]
//         gToys.splice(idx, 1, toy)
//         return _saveToysToFile().then(() => toy)

//     } else {
//         toy._id = _makeId()
//         toy.createdAt = Date.now()
//         gToys.push(toy)
//         return _saveToysToFile().then(() => toy)
//     }
// }

// function _makeId(length = 5) {
//     var txt = '';
//     var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     for (let i = 0; i < length; i++) {
//         txt += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return txt;
// }

// function _saveToysToFile() {
//     return new Promise((resolve, reject) => {
//         fs.writeFile('data/toys.json', JSON.stringify(gToys, null, 2), (err) => {
//             if (err) return reject(err)
//             resolve();
//         })
//     })
// }

// function _filterToys(filterBy) {
//     var toys = JSON.parse(JSON.stringify(gToys));

//     if (filterBy.inStock) {
//         const { inStock } = filterBy
//         if (inStock === 'true') toys = toys.filter(toy => toy.inStock)
//         else if (inStock === 'false') toys = toys.filter(toy => !toy.inStock)
//     }

//     // filter by name
//     if (filterBy.txt) {
//         const regex = new RegExp(filterBy.txt, 'i');
//         toys = toys.filter((toy) => regex.test(toy.name));
//     }

//     // filter by labels
//     if (filterBy.labels && filterBy.labels.length) {
//         toys = toys.filter(toy => {
//             return (!toy.labels.length ||
//                 filterBy.labels.some(lb => !lb.length || toy.labels.includes(lb)))
//         })
//     }
//     return toys
// }
