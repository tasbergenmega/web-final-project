// jQuery 3.7.1 - Menu built from array. Cart on this page is plain JS (main.js).
$(function () {

  const MENU_ITEMS = [
    { id: 1,  name: "Grand Burger",           category: "burgers",  price: 1800, desc: "Double beef patty, cheddar, fresh veggies, signature sauce.", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
    { id: 2,  name: "I'm Cheeseburger",       category: "burgers",  price: 1200, desc: "Juicy beef, melted cheese, pickles, onion, tomato.", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop" },
    { id: 3,  name: "Double Whopper",         category: "burgers",  price: 2200, desc: "Two flame-grilled patties with fresh lettuce and tomatoes.", img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop" },
    { id: 4,  name: "French Fries (L)",       category: "sides",    price: 750,  desc: "Crispy golden fries with sea salt.", img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop" },
    { id: 5,  name: "Chicken Nuggets (9 pcs)", category: "sides",   price: 1400, desc: "Juicy nuggets with a golden crust and dipping sauce.", img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop" },
    { id: 6,  name: "Cola 0.5L",              category: "sides",    price: 550,  desc: "Ice-cold refreshing drink.", img: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop" },
    { id: 7,  name: "Pack 1",                 category: "combos",   price: 1150, desc: "Chicken Burger + Fanta 0.25.", img: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop" },
    { id: 8,  name: "Pack 2",                 category: "combos",   price: 4150, desc: "Combo Beef Tasty — burger, fries, drink.", img: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop" },
    { id: 9,  name: "Ice Cream Cone",         category: "desserts", price: 450,  desc: "Classic soft-serve vanilla ice cream.", img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop" },
    { id: 10, name: "Chocolate Sundae",       category: "desserts", price: 650,  desc: "Vanilla ice cream with chocolate sauce and nuts.", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop" },
  ];

  const CATEGORY_LABELS = {
    all: "All",
    burgers: "Burgers",
    sides: "Sides & Drinks",
    combos: "Combos",
    desserts: "Desserts",
  };

  const main = document.querySelector("main");
  if (!main) return;

  // Local formatter - independent of main.js
  const priceText = (v) => v + " ₸";

  // Controls
  const $controlsSection = $("<section>").addClass("section");
  const $controls = $("<div>").addClass("menu-controls");

  const $searchGroup = $("<div>").addClass("form-group");
  $searchGroup.append(
    $("<label>").attr("for", "menu-search").text("Search dishes"),
    $("<input>").attr({ type: "search", id: "menu-search", placeholder: 'Try "burger" or "fries"' })
  );

  const $categoryGroup = $("<div>").addClass("form-group");
  const $categorySelect = $("<select>").attr("id", "menu-category");
  $.each(CATEGORY_LABELS, function (value, label) {
    $("<option>").val(value).text(label).appendTo($categorySelect);
  });
  $categoryGroup.append(
    $("<label>").attr("for", "menu-category").text("Category"),
    $categorySelect
  );

  const $sortGroup = $("<div>").addClass("form-group");
  const $sortSelect = $("<select>").attr("id", "menu-sort");
  [["default", "Default"], ["price-asc", "Price: low to high"], ["price-desc", "Price: high to low"], ["name", "Name A–Z"]]
    .forEach(function (opt) {
      $("<option>").val(opt[0]).text(opt[1]).appendTo($sortSelect);
    });
  $sortGroup.append(
    $("<label>").attr("for", "menu-sort").text("Sort by"),
    $sortSelect
  );

  const $resetBtn = $("<button>").attr("type", "button").addClass("btn btn-small btn-outline").text("Reset");

  $controls.append($searchGroup, $categoryGroup, $sortGroup, $resetBtn);
  $controlsSection.append($controls);

  const $countLine = $("<p>").attr("id", "menu-count").addClass("form-note");
  $controlsSection.append($countLine);

  $("main").children().eq(1).before($controlsSection);

  const $resultsSection = $("<section>").addClass("section");
  const $resultsGrid = $("<div>").addClass("cards").attr("id", "menu-results");
  $resultsSection.append($resultsGrid);
  $controlsSection.after($resultsSection);

  const state = { search: "", category: "all", sort: "default" };

  function filterItems() {
    const q = state.search.trim().toLowerCase();
    let items = MENU_ITEMS.slice();

    if (state.category !== "all") {
      items = items.filter(function (item) { return item.category === state.category; });
    }
    if (q) {
      items = items.filter(function (item) {
        return item.name.toLowerCase().indexOf(q) !== -1 ||
               item.desc.toLowerCase().indexOf(q) !== -1;
      });
    }
    if (state.sort === "price-asc") items.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "price-desc") items.sort(function (a, b) { return b.price - a.price; });
    if (state.sort === "name") items.sort(function (a, b) { return a.name.localeCompare(b.name); });

    return items;
  }

  function renderCard(item) {
    var $card = $("<article>").addClass("card menu-card");

    $("<img>").addClass("card-img")
      .attr({ src: item.img, alt: item.name })
      .appendTo($card);

    $("<h3>").text(item.name).appendTo($card);
    $("<p>").text(item.desc).appendTo($card);
    $("<p>").addClass("price").text(priceText(item.price)).appendTo($card);
    $("<button>").attr("type", "button")
      .addClass("btn btn-small add-to-cart")
      .text("Add to Cart")
      .appendTo($card);

    return $card;
  }

  function renderList() {
    const items = filterItems();
    const $grid = $("#menu-results");

    $grid.empty();
    $("#menu-count").text("Showing " + items.length + " of " + MENU_ITEMS.length + " dishes");

    if (items.length === 0) {
      $("<p>").addClass("cart-empty")
        .text("No dishes match your filters. Try clearing the search or choosing another category.")
        .appendTo($grid);
      return;
    }

    $.each(items, function (i, item) {
      $grid.append(renderCard(item));
    });
  }

  $searchGroup.find("input").on("input", function () {
    state.search = $(this).val();
    renderList();
  });
  $categorySelect.on("change", function () { state.category = $(this).val(); renderList(); });
  $sortSelect.on("change", function () { state.sort = $(this).val(); renderList(); });
  $resetBtn.on("click", function () {
    state.search = ""; state.category = "all"; state.sort = "default";
    $searchGroup.find("input").val("");
    $categorySelect.val("all");
    $sortSelect.val("default");
    renderList();
  });

  renderList();
});