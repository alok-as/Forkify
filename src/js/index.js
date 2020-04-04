//GLOBAL CONTROLLER
import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
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
    // const query = searchView.getInput();
    const query = 'pizza';

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
            console.log(state.search.results);
    
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

// elements.searchForm.addEventListener('submit',e => {
//     e.preventDefault();
//     controlSearch();
// });

// TESTING
window.addEventListener('load',e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click',e => {
    const btn = e.target.closest('.btn-inline');
    console.log(btn);

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.results, goToPage);
    }
})


//RECIPE CONTROLLER
// const recipe = new Recipe();
// recipe.getRecipe();
// console.log(recipe);
const controlRecipe = async () => {
    // Get ID from the url
    const id = window.location.hash.replace("#","");
    console.log(id);
    if (id) {
        // Prepare UI for changes

        //Creating a new Recipe Object
        state.recipe = new Recipe(id);

        // TESTING
        window.r = state.recipe;

        try {
            // Get Recipe Data
            await state.recipe.getRecipe();
    
           //Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
        
            //Render recipe
            console.log(state.recipe);
        }
        catch (error) {
            alert("Error Processing Recipe");
        }
    }
}


// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load',controlRecipe);
['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));