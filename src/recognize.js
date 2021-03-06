
// Sử dụng thư  viện
var request = require('sync-request');


let key = '528dfe66a4f14f4b881466b6b2488df8'; 
let groupId = 'face_group';


// Phát hiện khuôn mặt trong ảnh (Face Detection)
function detect(imageUrl) {
    console.log(`Begin to detect face from image: ${imageUrl}`);
    let url = `https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?recognitionModel=recognition_03&detectionModel=detection_02`;
    var res = request('POST', url, {
        headers: {
            'Ocp-Apim-Subscription-Key': key
        },
        json: {
            url: imageUrl
        }
    });

    if (res.statusCode == 200) {
        var result = JSON.parse(res.getBody('utf8'));
        console.log(`Found ${result.length} faces.`);
        return result;
    }
}

// Tìm khuôn mặt giống nhất trong Person Group (Face Recognition)
function identify(faceIds) {
    console.log(`Begin to identity face.`);
    let url = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/identify';
    var res = request('POST', url, {
        headers: {
            'Ocp-Apim-Subscription-Key': key
        },
        json: {
            "personGroupId": groupId,
            "faceIds": faceIds,
            "maxNumOfCandidatesReturned": 1,
        }
    });

    if (res.statusCode == 200) {
        console.log(`Finish identity face.`);
        return JSON.parse(res.getBody('utf8'));
    } else {
        console.log('Error');
        console.log(res.getBody('utf8'));
    }
}

// Nhận diện vị trí khuôn mặt và tên từ URL ảnh
function recognize(imageUrl, idolPerson) {
    console.log(`Begin to recognize image: ${imageUrl}`);
    var detectedFaces = detect(imageUrl);

    if (detectedFaces.length == 0) {
        console.log("Can't detect any face");
        return;
    }

    // Sau khi đã phát hiện các khuôn mặt,
    // So sánh chúng với mặt đã có trong person group
    var identifiedResult = identify(detectedFaces.map(face => face.faceId));

    var allIdols = identifiedResult.map(result => {

        // Lấy vị trí khuôn mặt trong ảnh để hiển thị
        result.face = detectedFaces.filter(face => face.faceId == result.faceId)[0].faceRectangle;

        // Tìm person đã được nhận diện từ DB
        if (result.
            candidates.length > 0) {

            // Kết quả chỉ trả về ID, dựa vào ID này ta tìm tên của person
            var idolId = result.candidates[0].personId;
            var person = idolPerson.filter(person => person.personId == idolId)[0];
            console.log(idolId)
            result.person = {
                name: person.name
            };
        } else {
            result.person = {
                name: '#unknown'
            }
        }
        return result;
    });

    console.log(`Finish recognize image: ${imageUrl}`);
    return allIdols;
}

exports.recognize = recognize;
exports.identify = identify;
exports.detect = detect;
// var result = recognize('https://kenh14cdn.com/thumb_w/600/2020/5/27/screenshot1-1590583004278676783598-crop-15905830130092016060937.png');
// console.log(JSON.stringify(result, null, 2));

