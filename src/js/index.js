//GLOBAL CONTROLLER
import Search from './models/Search';
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
    const query = searchView.getInput();

    if(query) {
        // New Search object and add to state
        state.search = new Search(query);

        //Prepare UI For Results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        //Search for Recipes
        await state.search.getResults();
        console.log(state.search.results);

        //Render results on UI
        clearLoader();
        searchView.renderResults(state.search.results);
    }

}

elements.searchForm.addEventListener('submit',e => {
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click',e => {
    const btn = e.target.closest('.btn-inline');
    console.log(btn);

    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.results, goToPage);
    }
})