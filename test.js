// Sử dụng thư  viện
var request = require('sync-request');

// Đọc thông tin idol trong file filtered-idols.json và thông tin person đã lưu từ API
var idolPerson = require('./idol-person.json');


let key = 'd5337aaf2cb849879e99f680d51997be'; // Thay thế bằng key của bạn
let groupId = 'face_group';


// Phát hiện khuôn mặt trong ảnh (Face Detection)
function detect(imageUrl) {
    console.log(`Begin to detect face from image: ${imageUrl}`);
    let url = `https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?recognitionModel=recognition_03`;
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

// Nhận diện vị trí khuôn mặt và tên idol từ URL ảnh
function recognize(imageUrl) {
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

        // Tìm idol đã được nhận diện từ DB
        if (result.candidates.length > 0) {

            // Kết quả chỉ trả về ID, dựa vào ID này ta tìm tên của idol
            var idolId = result.candidates[0].personId;
            var idol = idolPerson.filter(person => person.personId == idolId)[0];
            result.idol = {
                id: idol.userData,
                name: idol.name
            };
        } else {
            result.idol = {
                id: 0,
                name: 'Unknown'
            }
        }
        return result;
    });

    console.log(`Finish recognize image: ${imageUrl}`);
    return allIdols;
}




// // Test method recognize
function recognize1(imageUrl) {
    var result = recognize(imageUrl);
    console.log(JSON.stringify(result, null, 2));
    jsonData = JSON.stringify(result, null, 2)
    var fs = require('fs');
    fs.writeFile("test.txt", jsonData, function (err) {
        if (err) {
            console.log(err);
        }
    });
}

