// Config Section

var config = {
    PRODUCT_URL: 'http://localhost:4000/products',
    REEVIEW_URL: 'http://localhost:4000/review/',
    MAX_STARS: 5,
    MAX_SHOW_REVIEW: 10,
    MAX_CHAR_PER_LINE: 100,
}

var inMemory = {
    SELECTED_PRODUCT: 1,
    products: [],
    selectedStar: 0,
    reviewDiscription: '',
    reviewTitle: '',
    reviews: [],
    noReviews: config.MAX_SHOW_REVIEW,
};


// Request Section
var request = (function () {
    var xhr = new XMLHttpRequest();
    function getProdRequest() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            inMemory.products = JSON.parse(xhr.responseText);
            renderPage(inMemory.products);
        }
    };

    function getProdreviews() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            inMemory.reviews = JSON.parse(xhr.responseText);
            mergeReview();
            reviewItems();
        }
    };
    return {
        getProducts: function () {
            xhr.open('GET', config.PRODUCT_URL, true);
            xhr.send();
            xhr.onreadystatechange = getProdRequest;
        },
        getReviews: function (productId) {
            xhr.open('GET', config.REEVIEW_URL + productId, true);
            xhr.send();
            xhr.onreadystatechange = getProdreviews;
        }
    }
})();


// Main Section
function onLoad() {
    genarateProductTiles();
    renderReviewStars();
}

function renderPage(products, id) {
    if (products && products.length) {
        id = id || products[0].id;
        genarateTile(products);
        genarateReviewSection(id)
    } else {
        //show message
    }
}

function genarateTile(products) {
    var tiles = '';
    for (var index = 0; index < products.length; index++) {
        tiles += productTile(products[index], index);
    };

    document.getElementById("tiles").innerHTML = tiles;
};

function getProductstar(rating) {
    return '<span class="product_rating">' +
        '<div class="rating_star">' + rating.average + ' ★ </div>' +
        '</span>';
}

function getProductReviewInfo(rating) {
    return '<span class="prd_rating_review">' +
        '<span>' + rating.ratingCount + '  Ratings &   ' + rating.reviewCount + '  Reviews </span>' +
        '</span>';

}

function getStarName() {
    var rating = getRatingText(inMemory.selectedStar) || '';
    document.getElementById('startText').innerHTML = '<span class="' + rating.toLowerCase() + '">' + rating + ' </span>';
    return 'defaultStar ' + rating.toLowerCase();
}

function getRatingText(selectedStar) {
    if (selectedStar < 3) {
        return 'Average'
    }
    if (selectedStar >= 3 && selectedStar < 4) {
        return 'Good';
    }
    if (selectedStar >= 4) {
        return 'Excellent';
    }
}

function stars(index, selected) {
    var cssClass = selected ? getStarName(index) : 'defaultStar';
    return '<span data-star=' + index + ' class="' + cssClass + '">★</span>';
}

function renderReviewStars() {
    var startList = '';
    for (let index = 1; index <= config.MAX_STARS; index++) {
        startList += stars(index, index <= inMemory.selectedStar);
    }
    var starsElt = '<div class="starts" onclick="starSelection()">' +
        startList +
        '</div>';
    document.getElementById("star").innerHTML = starsElt;
}

function productTile(product, index) {
    var rating = product.rating;
    var reviews = getProductReviewInfo(rating);
    var star = getProductstar(rating);
    var productTileClass = inMemory.SELECTED_PRODUCT === product.id ? "product_tile selected" : "product_tile";
    return '<div onclick="productSelection(' + product.id + ')"class="' + productTileClass + '">' +
        '<img class="product_image" src="' + product.productImage + '"/>' +
        '<div class="productInfo">' +
        '<strong>' + product.title + '</strong>' +
        '<div class="ratingWrapper">' +
        star +
        reviews +
        '</div>' +
        '<div class="product_price"> र ' + product.pricing.value + '</div>' +
        '</div>' +
        '</div>';
};


function getReviewItem(item) {
    var rating = {
        average: item.rating
    }
    var star = getProductstar(rating);
    var textElt = reviewDiscription(item.text);
    return '<div class="ratingWrapper">' +
        star +
        '<span class="prd_rating_review">' +
        '<span>' + item.title + '</span>' +
        '</span>' +
        '<ul class="reviewList">' +
        textElt +
        '</ul>' +
        '<span class="reviewCreator">' +
        '<span> <pre class="clr">' + item.userName + '   ' + formatDate(item.created) + '</pre></span> ' +
        '</span>'+
    '<hr class="hr">' +
    '</div>';
}

function reviewDiscription(text) {


    var formatedtext = (text || '').split('.');
    var row = '';
    for (let index = 0; index < formatedtext.length; index++) {
        row += '<li>' + formatedtext[index] + '</li>';
    }
    return row;

}

function reviewItems() {
    var tiles = '';
    var reviews = inMemory.reviews;
    // limit max number of items to show MAX_SHOW_REVIEW
    var max =  reviews.length;
    for (var index = 0; index < max; index++) {
        tiles = getReviewItem(reviews[index]) + tiles;
    };
    document.getElementById("col").innerHTML = tiles;
}




function genarateProductTiles() {
    request.getProducts();
}

function genarateReviewSection(productId) {
    request.getReviews(productId);

}

function productSelection(id) {
    inMemory.SELECTED_PRODUCT = id;
    mergeReview();
    renderReviewStars();
    renderPage(inMemory.products, id);
    document.getElementById('error').innerHTML =''
}

function starSelection() {
    inMemory.selectedStar = parseInt(event.target.getAttribute('data-star'));
    setlocalStorage(inMemory.SELECTED_PRODUCT, {
        star: inMemory.selectedStar
    });
    renderReviewStars();
}

function formatDate(date) {
    var newDate = new Date(date);
    var monthNames = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun", "Jul",
        "Aug", "Sep", "Oct",
        "Nov", "Dec"
    ];

    var day = newDate.getDate();
    var monthIndex = newDate.getMonth();
    var year = newDate.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ', ' + year;
}

function setlocalStorage(key, value) {
    if (typeof (Storage) !== "undefined") {
        var oldData = getFromLocalStorage(key);
        var newValue = {
            ...oldData,
            ...value
        };
        localStorage.setItem(key, JSON.stringify(newValue));
    } else {
        //Sorry, your browser does not support localStorage

    }
}

function getFromLocalStorage(key) {
    if (typeof (Storage) !== "undefined") {
        return JSON.parse(localStorage.getItem(key));
    } else {
        //Sorry, your browser does not support localStorage
    }
}

function mergeReview() {
    var localData = getFromLocalStorage(inMemory.SELECTED_PRODUCT);
    if (localData) {
        var newReview = {
            created: new Date(),
            id: "5b1a8a5e14bad453a7bc8430",
            rating: parseInt(localData.star),
            text: localData.reviewDiscription,
            title: localData.reviewTitle || '',
            userName: "Arun",
        }
        inMemory.reviews.push(newReview);
    }

}

function saveReviews() {
    document.getElementById('error').innerHTML= '';
    var reviewDiscription = (document.getElementById('discriptionData').value || '');
    if(!reviewDiscription.length){
        document.getElementById('error').innerHTML = '<span> Review discription is required </span>';
        return;
    }
    reviewDiscription = reviewDiscription.match(/.{1,100}/g).join('.');
    var reviewTitle = document.getElementById('titleData').value;
    document.getElementById('discriptionData').value = ''
    document.getElementById('titleData').value = '';
    var reviewDetails = {
        reviewDiscription,
        reviewTitle
    };
    setlocalStorage(inMemory.SELECTED_PRODUCT, reviewDetails);
}
