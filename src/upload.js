function addLinkCropFace(people, link){
    people.forEach(function (item) {
        n = item.face.width
        y = Math.round(item.face.top - 0.25 * n)
        x = Math.round(item.face.left - 0.25 * n)
        width = Math.round(item.face.width * 1.7)
        height = Math.round(item.face.height * 1.7)
        crop = 'c_crop,h_' + height + ',w_' + width + ',x_' + x + ',y_' + y + ''
        splitLink = link.split('/');
        face_link = ''
        for (i = 0; i < splitLink.length; i++) {
            if (i == 0)
                face_link += splitLink[i]
            else if (splitLink[i] == 'upload')
                face_link += '/' + splitLink[i] + '/' + crop
            else
                face_link += '/' + splitLink[i]

        }
        item.face_link = face_link
        console.log('Link:')
        console.log(face_link)
    })
}
exports.addLinkCropFace = addLinkCropFace