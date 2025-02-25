/* ------------------------------------------------------------------------------------
   This module contains javascripts functions used only for the SCM multivendor functionality.
   ----------------------------------------------------------------------------------- */
var isPaused = false;
var id = 0;
function get_rate_quick(base, curr) {
    if (base == curr) {
        console.log('base currency== target');
        // no conversion to perform
        return;
    }
    var rate = scd_get_convert_rate(base, curr);

    // Check if there is a manual override options defined for this currency
    if (jscd_options.customCurrencyOptions !== "" && jscd_options.customCurrencyOptions[curr] !== undefined) {
        var currency_options = jscd_options.customCurrencyOptions[curr];

        // If a custom exchange rate has been specified, use it
        if ((base === settings.baseCurrency) && (currency_options["rate"] !== "")) {
            rate = (currency_options.rate);
        }

        // If an increase on top percentage has been specified, apply it
        if (currency_options["inc"] !== "") {
            rate = rate * (1 + (currency_options["inc"]) / 100);
        }
    }
    return rate;
}
function scd_wcmp_simpleConvert(obj, curr, ii) {
    var price = scd_extractPriceValueFromHtml(obj);
    if (c == 0) {
        window.localStorage.setItem('price' + ii, price);
    }
    var base = settings.baseCurrency;
    if (jQuery(obj).attr('basecurrency') !== undefined) {
        base = jQuery(obj).attr('basecurrency');
    }
    if (base == curr) {
        console.log('base currency== target');
        // no conversion to perform
        return;
    }
    var rate = scd_get_convert_rate(base, curr);

    // Check if there is a manual override options defined for this currency
    if (jscd_options.customCurrencyOptions !== "" && jscd_options.customCurrencyOptions[curr] !== undefined) {
        var currency_options = jscd_options.customCurrencyOptions[curr];

        // If a custom exchange rate has been specified, use it
        if ((base === settings.baseCurrency) && (currency_options["rate"] !== "")) {
            rate = (currency_options.rate);
        }

        // If an increase on top percentage has been specified, apply it
        if (currency_options["inc"] !== "") {
            rate = rate * (1 + (currency_options["inc"]) / 100);
        }
    }

    console.log('Extract price= ' + price);
    //price = price * rate;
    if (curr.indexOf('BTC') !== -1) {
        btc_converter(obj, ii);
    } else {
        //price = (price * Currency.rates[settings.baseCurrency]) / Currency.rates[curr];
        price = price * rate;
        price = price.toFixed(jscd_options.decimalPrecision);
        price = scd_humanizeNumber(price);
        // Add currency symbol

        var currency_attributes = scd_get_currency_symbol(curr);

        if ((jscd_options.useCurrencySymbol) && (currency_attributes.symbol !== undefined)) {

            currency_symbol = '<span class="woocommerce-Price-currencySymbol">' + currency_attributes.symbol + '</span>';

            currency_code = '<span class="woocommerce-Price-currencySymbol">' + scd_getTargetCurrency() + '</span>';

            switch (currency_attributes.position) {
                case 'left':
                    price = currency_symbol + price;
                    break;
                case 'right':
                    price = price + currency_symbol;
                    break;
                case 'left_space':
                    price = currency_symbol + ' ' + price;
                    break;
                case 'right_space':
                    price = price + ' ' + currency_symbol;
                    break;
                case 'left_country':
                    price = currency_code + ' ' + price + currency_symbol;
                    break;
                case 'right_country':
                    price = currency_symbol + price + ' ' + currency_code;
                    break;
                default:
                    price = price + currency_symbol;
                    break;
            }
        }
        else {
            price = price + '<span class="scd-currency-symbol">' + ' ' + curr + '</span>';
        }

        jQuery(obj).html(price);

        jQuery(obj).attr('basecurrency', curr); // this ensures that we will not convert this element again
    }
}
jQuery(document).ready(function () {
//--------------------------------------------------------------------------------------------
// set base currency if vendor select Base currency only 
jQuery(document).on('change', '#scd-currency-option', function (e) {
    e.preventDefault();
    if(jQuery(this).children("option:selected").val().indexOf('base-currency') !== -1){
        jQuery('#scd-currency-list').val(settings.baseCurrency);
    }
  });
  // use currency on default currency only if vendor select other currency
  jQuery(document).on('change', '#scd-currency-list', function (e) {
    e.preventDefault();
    if(jQuery(this).children("option:selected").val() !== settings.baseCurrency){
      jQuery('#scd-currency-option').val('only-default-currency');
    }
  });
//-----------------------------------------------------------------------------

    // //redondency price fix;
    // var the_prices = jQuery('.price');
    // for(var i=0; i< the_prices.length; i++){
    //     if(the_prices[i].textContent.split('-')[1] !==undefined){
    //         price1 = the_prices[i].textContent.split('-')[0].replace(/ /g, "");
    //         price2 = the_prices[i].textContent.split('-')[1].replace(/ /g, "");
    //         if(price1.indexOf(price2) !== -1){
    //             the_prices[i].textContent = the_prices[i].textContent.split('-')[0];
    //         }
    //     }
    // }

    // var the_prices = jQuery('.price_hold');
	// console.log(the_prices);
    // for(var i=0; i< the_prices.length; i++){
    //     if(the_prices[i].textContent.split('-')[1] !==undefined){
    //         price1 = the_prices[i].textContent.split('-')[0].replace(/ /g, "");
    //         price2 = the_prices[i].textContent.split('-')[1].replace(/ /g, "");
    //         if(price1.indexOf(price2) !== -1){
    //             the_prices[i].textContent = the_prices[i].textContent.split('-')[0];
    //         }
    //     }
    // }

     jQuery(document).on('click', '#scd-save-currency-option', function (e) {
        e.preventDefault();
		
        var user_currency_option = jQuery('#scd-currency-option').val();
		
		   var data = {
                'action': 'scd_update_user_currency_option',
                'user_currency_option': user_currency_option
			}
			jQuery.post(scd_ajax.ajax_url, data, function(response) {
				console.log(response);
				jQuery('#scd-action-status').html(response);
			});

        // save user currency
        var user_currency = jQuery('#scd-currency-list').val();
		
	   var data = {
					'action': 'scd_update_user_currency',
					'user_currency': user_currency
		}
		jQuery.post(scd_ajax.ajax_url, data, function(response) {
			console.log(response);
			jQuery('#scd-action-status').html(response);
		});
    });

     

    //Enregistrement d'un produit
    jQuery.post(scd_ajax.ajax_url, { 'action': 'scd_wcmp_get_user_currency' }, function (response) {
        localStorage['scd_get_user_currency'] = response.slice(0, -1);
    });

    //wcmp-venrod-dashboard-nav-link 
    jQuery('.wcmp-venrod-dashboard-nav-link--scd_setting').click(function (e) {
        e.preventDefault();
		
		var data = {
					'action': 'scd_show_user_currency'
		}
		jQuery.post(scd_ajax.ajax_url, data, function(response) {
                jQuery('.row').html(response);
                jQuery('.current-endpoint-title-wrapper').html('<h2>Set user currency</h2>');
		});
		
    });

    jQuery(document).on('click', '#scd-save-curr', function (e) {
        e.preventDefault();
		
        var user_currency = jQuery('#scd-currency-list').val();
		
		var data = {
                'action': 'scd_update_user_currency',
                'user_currency': user_currency
		}
		jQuery.post(scd_ajax.ajax_url, data, function(response) {
                jQuery('#scd-action-status').html(response);
		});

    });

    jQuery(document).on('click', '#scd-save-currency-option', function (e) {
        e.preventDefault();
        var user_currency_option = jQuery('#scd-currency-option').val();
		
		var data = {
                    'action': 'scd_update_user_currency_option',
                    'user_currency_option': user_currency_option
		}
		jQuery.post(scd_ajax.ajax_url, data, function(response) {
                jQuery('#scd-action-status').html(response);
		});

        // save user currency
        var user_currency = jQuery('#scd-currency-list').val();
		
		var data = {
                'action': 'scd_update_user_currency',
                'user_currency': user_currency
		}
		jQuery.post(scd_ajax.ajax_url, data, function(response) {
                jQuery('#scd-action-status').html(response);
		});
    });

    jQuery('#scd-wcv-select-currencies').attr('multiple', 'TRUE');
    jQuery('#scd-wcv-select-currencies').val(null).trigger('change');
    //jQuery('#scd-wcv-select-currencies').val(null).trigger('change');
    jQuery(".scd_wcv_select").data("placeholder", "Set currency per product...").chosen();

    jQuery('.scd_wcfm_select_price').attr('disabled', 'true');
    jQuery(".scd_wcfm_select, .scd_wcv_select").change(function () {
        var key = '';

        var newKeys, oldKeys;

        oldKeys = jQuery('#scd-bind-select-curr').val().toString().split(',');

        if (!jQuery('#scd-wcv-select-currencies').val() == '')
            newKeys = jQuery('#scd-wcv-select-currencies').val().toString().split(',');
        else {
            newKeys = '';
        }

        if (jQuery('#scd-bind-select-curr').val() !== '') {

            if (newKeys.length >= oldKeys.length) {

                if (newKeys.length > 0) {
                    key = newKeys[newKeys.length - 1];
                    for (var id = 0; id < newKeys.length; id++) {
                        if (oldKeys.includes(newKeys[id]) == false)
                            key = newKeys[id];
                    }
                }

                var myregselect = '<option id="reg_' + key + '" value=' + key + ' >Regular price (' + key + ')</option>';
                var mysalselect = '<option id="reg_' + key + '" value=' + key + ' >Sale price (' + key + ')</option>';
                jQuery('#scd_regularCurrency').append(myregselect);
                jQuery('#scd_saleCurrency').append(mysalselect);
                jQuery('#scd-bind-select-curr').val(jQuery('#scd-wcv-select-currencies').val());

            } else {
                for (var k = 0; k < oldKeys.length; k++) {
                    if (newKeys.indexOf(oldKeys[k]) == -1) {
                        jQuery('#scd_regularCurrency option[value="' + oldKeys[k] + '"]').remove();
                        jQuery('#scd_saleCurrency option[value="' + oldKeys[k] + '"]').remove();
                    }
                }
            }
            jQuery('#scd-bind-select-curr').val(jQuery('#scd-wcv-select-currencies').val());
        } else {
            if (newKeys.length > 0) {
                key = newKeys[newKeys.length - 1];
            }
            var myregselect = '<option id="reg_' + key + '" value=' + key + ' >Regular price (' + key + ')</option>';
            var mysalselect = '<option id="sale_' + key + '" value=' + key + ' >Sale price (' + key + ')</option>';
            jQuery('#scd_regularCurrency').append(myregselect);
            jQuery('#scd_saleCurrency').append(mysalselect);
            jQuery('#scd-bind-select-curr').val(jQuery('#scd-wcv-select-currencies').val());

        }

        if (jQuery(this).val() !== null) {
            var tabCurr = jQuery(this).val().toString().split(',');
            if (tabCurr.length > 0) {
                var regularBloc = '';
                var saleBloc = '';
                var newpriceField = '';
                var priceField = jQuery('#priceField').val();
                var tabC;
                for (var i = 0; i < tabCurr.length; i++) {
                    regularBloc = 'regular_' + tabCurr[i] + '_';
                    saleBloc = '-sale_' + tabCurr[i] + '_';
                    var regularPrice = '', salePrice = '';
                    if (priceField.indexOf(regularBloc) > -1) {
                        regularPrice = priceField.substr(priceField.indexOf(regularBloc) + regularBloc.length,
                            priceField.indexOf(saleBloc) - priceField.indexOf(regularBloc) - regularBloc.length);

                        tabC = priceField.toString().split(',');
                        var pos = -1;
                        for (var j = 0; j < tabC.length; j++) {
                            if (tabC[j].indexOf('sale_' + tabCurr[i]) > -1) {
                                pos = j;
                            }
                        }

                        if (pos > -1) {
                            var tc = tabC[pos].toString().split('_');
                            if (tc.length > 0) {
                                salePrice = tc[tc.length - 1];
                            }
                        }
                    }
                    if (i == 0) {
                        newpriceField = 'regular_' + tabCurr[i] + '_' + regularPrice + '-sale_' + tabCurr[i] + '_' + salePrice;
                    } else {
                        newpriceField = newpriceField + ',regular_' + tabCurr[i] + '_' + regularPrice + '-sale_' + tabCurr[i] + '_' + salePrice;
                    }
                }
                jQuery('#priceField').val(newpriceField);
            }
        }
    });

    // binding '#scd_regularCurrency' and #scd_saleCurrency'
    jQuery('#scd_regularCurrency').change(function () {
        jQuery('#scd_saleCurrency').val(jQuery('#scd_regularCurrency').val()).change();
        //jQuery('#scd_regularPriceCurrency').val( jQuery('#regularField_'+jQuery('#scd_regularCurrency').val()).val());
        //jQuery('#scd_salePriceCurrency').val( jQuery('#saleField_'+jQuery('#scd_saleCurrency').val()).val());
        var priceField = jQuery('#priceField').val();

        var regularBloc = 'regular_' + jQuery('#scd_regularCurrency').val() + '_';
        var saleBloc = '-sale_' + jQuery('#scd_regularCurrency').val() + '_';
        var price = priceField.substr(priceField.indexOf(regularBloc) + regularBloc.length,
            priceField.indexOf(saleBloc) - priceField.indexOf(regularBloc) - regularBloc.length);
        jQuery('#scd_regularPriceCurrency').val(price);

        var tabCurr = priceField.toString().split(',');
        var pos = -1;
        for (var j = 0; j < tabCurr.length; j++) {
            if (tabCurr[j].indexOf('sale_' + jQuery('#scd_saleCurrency').val()) > -1) {
                pos = j;
            }
        }

        if (pos > -1) {
            var tc = tabCurr[pos].toString().split('_');
            if (tc.length > 0) {
                jQuery('#scd_salePriceCurrency').val(tc[tc.length - 1]);

            }
        }

    });
    // end binding

    // start save regular price entered for each currency when hoverout field  
    jQuery('#scd_regularPriceCurrency').focusout(function () {
        // jQuery('#regularField_'+jQuery('#scd_regularCurrency').val()).val(jQuery(this).val());

        var priceField = jQuery('#priceField').val();
        var regularBloc = 'regular_' + jQuery('#scd_regularCurrency').val() + '_';
        var saleBloc = '-sale_' + jQuery('#scd_regularCurrency').val() + '_';

        priceField = priceField.substr(0, priceField.indexOf(regularBloc)) + regularBloc + jQuery(this).val() +
            priceField.substr(priceField.indexOf(saleBloc));
        jQuery('#priceField').val(priceField);

    });
    // end save regular price

    // start save sale price entered for each currency when hoverout field  
    jQuery('#scd_salePriceCurrency').focusout(function () {
        //jQuery('#saleField_'+jQuery('#scd_saleCurrency').val()).val(jQuery(this).val());

        var priceField = jQuery('#priceField').val();
        var tabCurr = priceField.toString().split(',');
        var pos = -1;
        for (var j = 0; j < tabCurr.length; j++) {
            if (tabCurr[j].indexOf('sale_' + jQuery('#scd_saleCurrency').val()) > -1) {
                pos = j;
            }
        }
        if (pos > -1) {
            tabCurr[pos] = tabCurr[pos].substr(0, tabCurr[pos].indexOf('sale')) + 'sale_' + jQuery('#scd_saleCurrency').val() + '_' + jQuery(this).val();
            priceField = tabCurr[0];
            for (var j = 1; j < tabCurr.length; j++) {
                priceField = priceField + ',' + tabCurr[j];
            }

            jQuery('#priceField').val(priceField);
        }
    });
    // end save sale price

});


///lAST FIX ON LAST CUSTUMER REQUEST 09-02-2021
window.onload = () => {
    const interval_convert_products = setInterval(function () {
        if (jQuery('div.wcmp-wrapper .amount bdi')[0] != undefined) {
            elements = jQuery('div.wcmp-wrapper .amount bdi');
            var len = elements.length;
            for (var i = 0; i < len; i++) {
                scd_wcmp_simpleConvert(elements[i], localStorage['scd_get_user_currency'], i);
            }
            
            elts = jQuery('div.wcmp-wrapper td.price');
            var len = elts.length;
            for (var z = 0; z < len; z++) {
                if(elts[z].textContent.indexOf('-') !== -1){
                    if(elts[z].textContent.split('-')[0].replace(/ /g,'').indexOf(elts[z].textContent.split('-')[1].replace(/ /g,'')) !== -1){
                        elts[z].textContent = elts[z].textContent.split('-')[1].replace(/ /g,'');
                    }
                }
            }
          // clearInterval(interval_convert_products);
        }
        if (jQuery('.paginate_button a')[0] != undefined) {
            btn = jQuery('.paginate_button a');
            for(var b = 0; b < btn.length; b++){
                    jQuery(btn[b]).click(function(){
                        const interval_convert_productss = setInterval(function () {
                        if (jQuery('div.wcmp-wrapper .amount bdi')[0] != undefined) {
                            elementss = jQuery('div.wcmp-wrapper .amount bdi');
                            var len = elementss.length;
                            for (var i = 0; i < len; i++) {
                                scd_wcmp_simpleConvert(elementss[i], localStorage['scd_get_user_currency'], i);
                            }
                            clearInterval(interval_convert_productss);
                        }
                    },500);
                });
            }
        }
    }, 900);
}
