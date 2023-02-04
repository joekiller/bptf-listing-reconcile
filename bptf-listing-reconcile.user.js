// ==UserScript==
// @name         bptf-listing-reconcile
// @namespace    https://github.com/joekiller
// @version      0.4
// @description  fixes all those broke ass listings
// @author       joekiller
// @match        https://backpack.tf/classifieds?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backpack.tf
// @downloadURL  https://github.com/joekiller/bptf-listing-reconcile/raw/main/bptf-listing-reconcile.user.js
// @updateURL    https://github.com/joekiller/bptf-listing-reconcile/raw/main/bptf-listing-reconcile.meta.js
// @grant        none
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// @run-at       document-idle
// ==/UserScript==
const params = new URLSearchParams(window.location.search);

const steamid = params.get('steamid');

var liveAssets = localStorage.getItem('liveAssets');
var fixing = localStorage.getItem('fixing');
var live = localStorage.getItem('live') === 'true';

function reset() {
    liveAssets = null;
    localStorage.removeItem('liveAssets');
    localStorage.removeItem('fixing');
    localStorage.removeItem('live');
    live = false;
    fixing = null;
}

function fixAssets() {
    let candidates = [];
    if(candidates.length === 0) {
        let panel = document.evaluate(
            '//div[contains(@class, "panel-main") and descendant::span[text() = "Sell Orders"]]',
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue
        const rows = panel.getElementsByClassName("listing");
        for (let i = 0; i < rows.length; i++) {
            let listing = rows[i];
            if(listing.getElementsByClassName("tag bottom-right")[0].getElementsByTagName("span")[0].textContent.includes('$')) {
                continue;
            }
            let listingId = listing.id.split('_')[1]
            if(!liveAssets.includes(listingId)) {
                candidates.push(listing.id);
            }
        }
        if(!live && candidates.length > 0) {
            window.alert( `${live ? 'Will delete' : 'Would have deleted'} ` + candidates.join() )
        }
    }
    const hadCandidates = live && candidates.length > 0;
    while(live && candidates.length > 0) {
        const id = candidates.shift()
        const listing = document.getElementById(id);
        listing.getElementsByClassName('listing-remove')[0].click();
        listing.getElementsByClassName('listing-remove-prompt')[0].click();
    }
    if(hadCandidates) {
        return location.assign(location.href);
    }
    if(onLastPage()) {
        localStorage.removeItem('fixing');
        fixing = null;
        if(live) {
            reset();
        }
        window.alert( "Finished" );
        openFirstPage();
        run();
    } else {
        if(live && candidates.length > 0) {
            fixAssets();
        } else {
            openNextPage();
        }
    }
}

// create fix button
var fixBtn = document.createElement( 'input' );
with( fixBtn ) {
    setAttribute( 'value', 'Fix this shit' );
    setAttribute( 'type', 'button' );
    setAttribute( 'id', 'btn-fix' );
    setAttribute( 'class', 'btn btn-default btn-fix' );
}

// create get inventory button
var inventoryBtn = document.createElement( 'a' );
with( inventoryBtn ) {
    setAttribute( 'href', 'https://steamcommunity.com/inventory/'+ steamid +'/440/2?l=english&count=3000' );
    setAttribute( 'target', '_blank' );
    setAttribute( 'id', 'btn-load-inventory' );
    setAttribute( 'class', 'btn btn-default btn-load-inventory' );
}
inventoryBtn.appendChild(document.createTextNode("Load Raw Inventory In New Tab"));

var inventoryInput = document.createElement( 'input' );
with( inventoryInput ) {
    setAttribute( 'id', 'inventory' );
    setAttribute( 'placeholder', 'Paste your inventory here' );
    setAttribute( 'name', 'inventory' );
    setAttribute( 'type', 'text' );
    setAttribute( 'class', 'form-control inventory-input' );
}

// reset
var resetBtn = document.createElement( 'input' );
with( resetBtn ) {
    setAttribute( 'value', 'Reset Reconcile Plugin' );
    setAttribute( 'id', 'btn-reset' );
    setAttribute( 'type', 'button' );
    setAttribute( 'class', 'btn btn-default btn-reset' );
}

var liveBtn = document.createElement( 'input' );
with( liveBtn ) {
    setAttribute( 'type', 'button' );
    setAttribute( 'id', 'btn-live' );
    setAttribute( 'class', 'btn btn-default btn-live' );
}

function openNextPage() {
    let nextButton = document.getElementsByClassName('fa fa-angle-right')[0];
    nextButton.click();
}

function openFirstPage() {
    let firstPageButton = document.getElementsByClassName('fa fa-angle-double-left')[0];
    firstPageButton.click();
}

function onFirstPage() {
    return document.getElementsByClassName('fa fa-angle-left')[0].parentElement.parentElement.className == "disabled";
}

function onLastPage() {
    return document.getElementsByClassName('fa fa-angle-right')[0].parentElement.parentElement.className == "disabled";
}

document.getElementById( 'search-crumbs' ).appendChild( fixBtn );
document.getElementById( 'search-crumbs' ).appendChild( liveBtn );
document.getElementById( 'search-crumbs' ).appendChild( resetBtn );
document.getElementById( 'search-crumbs' ).appendChild( inventoryBtn );
document.getElementById( 'search-crumbs' ).appendChild( inventoryInput );

function visibility() {
    if(!liveAssets) {
        inventoryBtn.style.display = "inline";
        inventoryInput.style.display = "inline";
    } else {
        inventoryBtn.style.display = "none";
        inventoryInput.style.display = "none";
    }
    if(liveAssets) {
        fixBtn.style.display = "inline";
        liveBtn.style.display = "inline";
        resetBtn.style.display = "inline";
        if(fixing)          {
            fixBtn.value = 'Fixing';
            fixBtn.disabled  = true;
        } else {
            fixBtn.value = 'Fix this shit';
            fixBtn.disabled  = false;
        }
    } else {
        fixBtn.style.display = "none";
        resetBtn.style.display = "none";
        liveBtn.style.display = "none";
    }
    document.getElementById("btn-live").value = live ? 'Live Mode' : 'Test Mode';
}

function run() {
    if(!fixing && !liveAssets && onFirstPage()) {
        reset();
    }
    visibility();
    if(fixing && liveAssets) {
        fixAssets();
    }
}

inventoryInput.addEventListener('change', (event) => {
    if(!liveAssets) {
        try {
            liveAssets = JSON.parse(event.target.value).assets.map((i) => i.assetid);
            localStorage.setItem('liveAssets', liveAssets);
        } catch (e) {
            reset();
            window.alert( "There was an error: " + e)
            console.error(e);
        }
        var input = document.getElementById("inventory");
        if (input.value !== "") {
            input.value = "";
        }
        run();
    }
});

fixBtn.addEventListener('click', () => {
    fixing = 'true'
    localStorage.setItem('fixing', fixing);
    run()
});

liveBtn.addEventListener('click', () => {
    localStorage.setItem('live', !live ? 'true' : 'false');
    live = !live;
    document.getElementById("btn-live").value = live ? 'Live Mode' : 'Test Mode';
});

resetBtn.addEventListener('click', () => {
    reset()
    run()
});

run()
