const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'iuhcongnghemoi',
    api_key: '999481664635386',
    api_secret: 'GUfv84rFUSuz6RMM5Qj06VYBUN4'
});
var listAlbum = []
var listImage = []
var list_key = []
loadAlbum()
loadAllImage()

function loadAlbum() {
    cloudinary.api.sub_folders("image",
        async function (error, subf) {
            for (let i = 0; i < subf.folders.length; i++) {
                console.log(subf.folders[i].path);
                cloudinary.api.resources({
                    type: 'upload',
                    prefix: subf.folders[i].path,
                    max_results: 1
                }, async function (error, results) {
                    let obj = {
                        first: results.resources[0],
                        lbl: subf.folders[i].name
                    }
                    listAlbum[i] = obj
                });
            }
        });
}

function getListAlbum() { return listAlbum }

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
            list_key[i] = key
            i += 1
        } else {
            collection.push(item);
        }
    });
    return map;
}
function loadAllImage() {
    i = 0
    cloudinary.api.resources({
        type: 'upload',
        max_results: 100
    }, function (error, results) {
        results.resources.forEach(function (each) {
            each.created_at = each.created_at.slice(0, 10)
        })
        const grouped = groupBy(results.resources, resource => resource.created_at);

        for (let i = 0; i < list_key.length; i++) {
            let obj = {
                res: grouped.get(list_key[i]),
                lbl: list_key[i]
            }
            listImage[i] = obj
        }

    });
}
function getAllImage() {

    return listImage
}
async function getOneAlbum(res, lbl) {
    album = []
    await cloudinary.api.resources({
        type: 'upload',
        prefix: 'image/' + lbl,
        max_results: 100
    }, function (error, results) {
        album = results
    });
    res.render('album', {
        results: album.resources,
        lbl: lbl
    })
    
    // album = getResult()
    // console.log(album)
    // return album
    // // }
    // // getResult().then(() => {
    // //      return result
    // // })

}
async function uploadImage() {
    await cloudinary.uploader.upload(link, {
        folder: 'All_image'
    },
        function (error, result) {
            link = result.url;
        });
}

exports.getListAlbum = getListAlbum
exports.getAllImage = getAllImage
exports.uploadImage = uploadImage
exports.getOneAlbum = getOneAlbum