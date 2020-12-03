// Sử dụng thư viện
var request = require('sync-request');


let key = 'd5337aaf2cb849879e99f680d51997be';
let groupId = 'face_group';

function submitOnePerson(name, link) {
    console.log('Begin submit person ', name)
    let url = `https://southeastasia.api.cognitive.microsoft.com/face/v1.0/persongroups/${groupId}/persons`;
    console.log('Begin submit idol: ', name);
    var res = request('POST', url, {
        headers: {
            'Ocp-Apim-Subscription-Key': key
        },
        json: {
            name: name,
            userData: 'data'
        }
    });
    if (res.statusCode == 200) {
        var person = JSON.parse(res.getBody('utf8'));

        console.log(`SUCCESS - Submit idol . Person name`, name);
        submitIdolFace(person.personId, link);
    }


}

// Submit ảnh của person lên hệ thống
function submitIdolFace(personId, faceUrl) {
    console.log(`Begin submit image ${faceUrl} for person id ${personId}`);
    // console.log(`Begin submit image ${faceUrl.substring(20,60)} for person id ${personId}`);
    let url = `https://southeastasia.api.cognitive.microsoft.com/face/v1.0/persongroups/${groupId}/persons/${personId}/persistedFaces?detectionModel=detection_02`;
    var res = request('POST', url, {
        headers: {
            'Ocp-Apim-Subscription-Key': key
        },
        json: {
            url: faceUrl
        }
    });
    console.log(res.statusCode)
    if (res.statusCode == 200) {
        console.log(`SUCCESS - Submit image ${faceUrl.substring(20, 60)} for person id ${personId}.`);
    }
}
function getListPerson() {

    let url = `https://southeastasia.api.cognitive.microsoft.com/face/v1.0/persongroups/face_group/persons?top=1000`;
    var res = request('GET', url, {
        headers: {
            'Ocp-Apim-Subscription-Key': key
        }
    });
    console.log(res.statusCode)

    if (res.statusCode == 200) {
        return JSON.parse(res.getBody('utf8'))

    }
}
function train() {
    console.log('Begin train')
    let url = `https://southeastasia.api.cognitive.microsoft.com/face/v1.0/persongroups/${groupId}/train`;
    var res = request('POST', url, {
        headers: {
            'Ocp-Apim-Subscription-Key': key
        }
    });
    console.log(res.statusCode)
    if (res.statusCode == 200) {
        console.log(`TRAIN SUCCESS`);
    }
}

exports.submitIdolFace = submitIdolFace
exports.submitOnePerson = submitOnePerson
exports.train = train
exports.getListPerson = getListPerson

// for (let idol of idols) {
//     submitIdol(idol);
// }

// NodeJS không có thread.sleep nên ra dùng tạm function này
// function sleep(time) {
//     console.log('Begin Sleep');
//     var stop = new Date().getTime();
//     while (new Date().getTime() < stop + time) {
//         ;
//     }
//     console.log('End Sleep');
// }

// // Tạo idol trên hệ thống
// function submitIdol(idol) {
//     let url = `https://api.projectoxford.ai/face/v1.0/persongroups/${groupId}/persons`;
//     console.log(`Begin submit idol: ${idol.id} - ${idol.name}`);
//     var res = request('POST', url, {
//         headers: {
//             'Ocp-Apim-Subscription-Key': key
//         },
//         json: {
//             name: idol.name,
//             userData: idol.id
//         }
//     });

//     if (res.statusCode == 200) {
//         var person = JSON.parse(res.getBody('utf8'));

//         console.log(`SUCCESS - Submit idol ${idol.id} - ${idol.name}. Person ID: ${person.personId}`);

//         // Bỏ 4 ảnh đầu
//         for (let i = 4; i < idol.images.length; i++) {
//             // Submit ảnh của idol lên hệ thống
//             try {
//                 submitIdolFace(person.personId, idol.images[i].image);
//                 sleep(4 * 1000); // Sleep 4 giây vì limit 20 call/phút
//             } catch (err) {
//                 console.log('ERROR');
//                 console.log(err);
//             }
//         }
//     } else {
//         console.log(res.getBody('utf8'));
//     }

// }