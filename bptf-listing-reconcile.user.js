// ==UserScript==
// @name         bptf-listing-reconcile
// @namespace    https://github.com/joekiller
// @version      0.1
// @description  fixes all those broke ass listings
// @author       joekiller
// @match        https://backpack.tf/classifieds?steamid=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=backpack.tf
// @downloadURL  https://github.com/joekiller/bptf-listing-reconcile/raw/main/bptf-listings-reconcile.user.js
// @updateURL    https://github.com/joekiller/bptf-listing-reconcile/raw/main/bptf-listings-reconcile.meta.js
// @grant        none
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// ==/UserScript==

const params = new URLSearchParams(window.location.search);

const steamid = params.get('steamid');

var inventory = localStorage.getItem('liveAssets');
var fixing = localStorage.getItem('fixing') || false;
var live = localStorage.getItem('fixing') || false;

function fixAssets(liveAssets) {
    const candidates = [];
    const rows = document.getElementsByClassName("listing");
    for (let i = 0; i < rows.length; i++) {
        let listing = rows[i];
        if(listing.getElementsByClassName('item')[0].getAttribute('data-market_p') != -1) {
            continue;
        }
        let listingId = listing.id.split('_')[1]
        if(liveAssets.includes(listingId)) {
            console.log('present');
        } else {
            candidates.push(listing.id);
        }
    }
    if(live) {
        for (let i = 0; i < candidates.length; i++) {
            let listing = document.getElementById(candidates[i]);
            listing.getElementsByClassName('listing-remove')[0].click()
            listing.getElementsByClassName('listing-remove-prompt')[0].click()
        }
    } else if(candidates.length > 0) {
        window.alert( "Would have deleted " + candidates.join() )
    }
    if(onLastPage) {
        localStorage.removeItem('fixing');
        openFirstPage();
        window.alert( "Finished" );
    }
}

function onCLickFix() {
    if(inventory == null) {
        window.alert( "paste your inventory in the field first" );
    }
    try {
        const liveAssets = JSON.parse(inventory).assets.map((i) => i.assetid);
        localStorage.setItem('liveAssets', liveAssets);
        fixAssets(liveAssets);
    } catch (e) {
        window.alert( "There was an error: " + e)
        console.error(e);
    }
}

// create fix button
var fixBtn = document.createElement( 'input' );
with( fixBtn ) {
  addEventListener('click', onCLickFix);
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
inventoryBtn.appendChild(document.createTextNode("Load Inventory"));

var inventoryInput = document.createElement( 'input' );
with( inventoryInput ) {
    addEventListener('change', (event) => {
      inventory = event.target.value
      var input = document.getElementById("inventory");
      if (input.value !="") {
         input.value = "";
     }
     input.style.display = "none";
     inventoryBtn.style.display = "none";
     load();
  });
  setAttribute( 'id', 'inventory' );
  setAttribute( 'placeholder', 'Paste your inventory here' );
  setAttribute( 'name', 'inventory' );
  setAttribute( 'type', 'text' );
  setAttribute( 'class', 'form-control inventory-input' );
}

// reset
var resetBtn = document.createElement( 'input' );
with( resetBtn ) {
    addEventListener('click', () => {
        inventory = null;
        inventoryInput.style.display = "block";
        inventoryBtn.style.display = "block";
        localStorage.removeItem('liveAssets');
        localStorage.removeItem('fixing')
        [document.getElementById("btn-fix"),
         document.getElementById("btn-reset"),
         document.getElementById("inventory-input"),
         document.getElementById("btn-load-inventory")].map(e => {if(e) e.remove()})
    });
    setAttribute( 'value', 'Reset Reconcile Plugin' );
    setAttribute( 'id', 'btn-reset' );
    setAttribute( 'type', 'button' );
    setAttribute( 'class', 'btn btn-default btn-reset' );
}

var liveBtn = document.createElement( 'input' );
with( liveBtn ) {
  addEventListener('click', () => {
      localStorage.setItem('live', !live);
      live = !live;
       document.getElementById("btn-live").value = live ? 'Live' : 'Test';
  });
  setAttribute( 'value', live ? 'Live' : 'Test' );
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

function onLastPage() {
    return document.getElementsByClassName('fa fa-angle-right')[0].parentElement.parentElement.className == "disabled";
}

function load() {
    // append at end
    if(inventory) {
        document.getElementById( 'search-crumbs' ).appendChild( fixBtn );
        document.getElementById( 'search-crumbs' ).appendChild( resetBtn );
    } else {
        document.getElementById( 'search-crumbs' ).appendChild( inventoryBtn );
        document.getElementById( 'search-crumbs' ).appendChild( inventoryInput );
    }
}

if(fixing && inventory) {
    fixAssets(inventory);
} else {
    load();
}
document.getElementById( 'search-crumbs' ).appendChild( liveBtn );