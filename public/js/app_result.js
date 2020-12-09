'use strict';

let st = document.getElementById('meals').value;
let idArray = st.split(',');
console.log(idArray);

idArray.forEach(element => {
    document.getElementById(element).addEventListener('click', function sendQuery(event) {
        if (event.target.id === 'saveFood') {
            event.preventDefault();
            let form = event.target.parentNode;
            let obj = {
                id: form.id.value,
                name: form.name.value,
                ingredients: form.ingredients.value,
                steps: form.steps.value,
                img_url: form.img_url.value,
                vid_url: form.vid_url.value,
                category: form.category.value,
                type: form.type.value,
                route: form.route.value
            }
            let url = `https://to-be-or-not-to-be-recipen.herokuapp.com${obj.route}`;
            console.log(url);
            if (obj.type === 'food') {
                obj['area'] = form.area.value;

            }


            console.log(obj)
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj),
            })
                .then(response => response.json())
                .then(data => {
                    if (data !== 'done') {
                        alert('Already Exists In Your Favorite List');
                    }
                    else {
                        alert('Added To Your Favorite List');
                    }
                    console.log(data)
                })
                .catch(e => console.log(e));


        }
    });
});




