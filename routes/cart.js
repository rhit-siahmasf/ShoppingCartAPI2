// constants & imports
var express = require('express');
var router = express.Router();
var fs = require('fs');
var cartFileName = './cartData.json';
var itemsFileName = './itemData.json';

// values for each shopping cart session
var shoppingCartID;
var itemID, itemQuantity;

router.get('/', (req, res, next) => {
  next();
  console.log(`No shopping cart in session...`);
});

router.get('/:id', (req, res, next) => {
  shoppingCartID = req.params.id;

  if (!shoppingCartID) {
    res.send('error: NULL BODY for shoppingCartID');
  } else {
    var newCart = { shoppingCartID: `${shoppingCartID}` };
    
    fs.readFile(cartFileName, (err, data) => {
      
      let parsed = JSON.parse(data);
      
      for(var curr in parsed) {
        if(parsed[curr]["shoppingCartID"] == shoppingCartID){
          console.log(`Cart session already exists with ID: ${shoppingCartID}`);
          return;
        }
      }

      parsed.push(newCart);
      data = JSON.stringify(parsed);

      fs.writeFile(cartFileName, data, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Success storing new cart session in ${cartFileName} with ID: ${shoppingCartID}`);
        }
      });

    });

    res.send(shoppingCartID);
    next();
    console.log(`Shopping cart items from ${shoppingCartID} successfully retrieved.`);
  }
});

router.get('/:id/items', (req, res, next) => {

  if (!shoppingCartID) {
    res.send('error: NULL BODY for shoppingCartID');
  } else {
    
    fs.readFile(itemsFileName, (err, data) => {
      
      let parsed = JSON.parse(data);
      let items;

      for(var curr in parsed) {
        if(parsed[curr]["cartSessionID"] == shoppingCartID) {
          items = curr;
          console.log(`Sending cart items with cart ID:  ${shoppingCartID}`);
        }
      }
      let itemsInCart = [];
      for(var curr in parsed[items]["items"]) {

        itemsInCart.push(parsed[items]["items"][curr]["itemID"]);
      
      }
      // posting all items in the cart
      res.send(itemsInCart);
      next();
      console.log(`Shopping cart items from ${shoppingCartID} successfully sent.`);
    });
  }
})

router.get(`/${shoppingCartID}/items/item/:sItemID`, (req, res, next) => {

  itemID = req.query.sItemID;
  itemQuantity = req.query.quantity;

  console.log(itemID);

  if(!itemID) {
      res.send(`Null body for item ID`);
  } else {
      if(!itemQuantity || !(itemQuantity < 1)) {
          console.log(`Item does not have quantity. Remove item from cart...`);
      } else {

          let itemFoundInCart;

          fs.readFile(itemsFileName, (err, data) => {
              let parsed = JSON.parse(data);
              for(var curr in parsed) {
                for(var eachItem in parsed[curr]["items"]) {
                    if(parsed[curr]["items"][eachItem]["itemID"] == itemID) {
                      itemFoundInCart = parsed[curr]["items"][eachItem];
                    }
                }
              }
        
          });

          if(!itemFoundInCart) {
              res.send(`No item in cart session with Item ID: ${itemID}`);
          } else {
              if(itemFoundInCart["quantitySelected"] != itemQuantity) {

                  itemFoundInCart.put("quantitySelected", itemQuantity);
                  console.log(`Item quantity for Item ID ${itemID} updated to: ${itemQuantity}`);
              } else {
                  console.log(`Item quantity for Item ID: ${itemID} does not need a quantity update.`);
              }

              res.send(itemFoundInCart);
              next();
              console.log(`Item from cart with Item ID: ${itemID} successfully found in cart.`)
          }
      }
  }

})


module.exports = router;
