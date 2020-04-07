//GLOBAL CONTROLLER
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader} from './views/base'; 


// Global state of the application
// -- Search Object
// -- Current Recipe Object
// -- Shopping List Object
// -- Liked recipes
const state = {};

//SEARCH CONTROLLER
const controlSearch = async () => {
    // Get the Query from the view
    const query = searchView.getInput();

    if(query) {
        // New Search object and add to state
        state.search = new Search(query);

        //Prepare UI For Results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //Search for Recipes
            await state.search.getResults();
    
            //Render results on UI
            clearLoader();
            searchView.renderResults(state.search.results);
        }
        catch (error) {
            alert('Something wrong with the search');
            clearLoader();
        }
    }

}

elements.searchForm.addEventListener('submit',e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click',e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.results, goToPage);
    }
})


//RECIPE CONTROLLER
const controlRecipe = async () => {
    // Get ID from the url
    const id = window.location.hash.replace("#","");

    if (id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if(state.search) {
            searchView.highlightSelected(id);
        }

        //Creating a new Recipe Object
        state.recipe = new Recipe(id);

        try {
            // Get Recipe Data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
           //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
        
            //Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        }
        catch (error) {
            console.log(error);
        }
    }
};


//LIST CONTROLLER 
const controlList = () =>  {
    //Create a new List if there is not
    if(!state.list) state.list = new List();

    //Addinng each ingredient to the list
    state.recipe.ingredients.map(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
   
};


//LIKES CONTROLLER
const controlLikes = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    //Not yet liked current recipe
    if(!state.likes.isLiked(currentId)){
        //Add like to the state
        const newLike = state.likes.addLike(currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //Toggle the like button
        likesView.toggleLikeButton(true);

        //Add like to the UI List
        likesView.renderLike(newLike);
    }
    else{
        //Remove like from the state
        state.likes.deleteLike(currentId);

        //Toggle the like button
        likesView.toggleLikeButton(false);

        //Remove like from the UI List
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());

};


['hashchange','load'].forEach(event => window.addEventListener(event, controlRecipe));

//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }

    //Adding recipe to Shopping list
    else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
    
    // Liking a recipe
    else if (e.target.matches('.recipe__love, .recipe__love *')) {
        controlLikes();
    }
});



// Handling delete and update list items
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle delete button
    if(e.target.matches('.shopping__delete , .shopping__delete *')){
        //Delete item from state
        state.list.deleteItem(id);

        //Delete item from UI
        listView.deleteItem(id);
    }
    // Hanlde the count update
    else if (e.target.matches('.shopping__count--value')) {
        const val = parseInt(e.target.value,10);
        state.list.updateCount(id, val);
    }
})


//RESTORING LIKED RECIPES ON PAGE LOAD
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore Likes
    state.likes.readStorage();

    //Toggle Like Menu
   likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render Existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


