import axios from 'axios';
import base from '../views/base';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
            console.log(res);
        }
        catch (error) {
            console.log(error);
            alert('Something went wrong :(');
        }
    }

    calcTime() {
        //Assuming that we need 15 mins for every 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons','tablespoon','ounces','ounce','teaspoons','teaspoon','cups','pounds','package'];
        const unitShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound','pack'];
        const units = [...unitShort,'kg','g']

        const newIngredients = this.ingredients.map(el=> {
            // Uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit,i) => {
                ingredient = ingredient.replace(unit,unitShort[i]);
            });

            // Remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;

            if(unitIndex > -1) {
                //There is a unit 
                // Ex- 4 1/2 cups, arrCount is [4,1/2]
                // Ex 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-','+'));
                }
                else {
                    count = eval(arrIng.slice(0,unitIndex).join('+'));
                }
                
                objIng = {
                    count: count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            }
            else if ( parseInt(arrIng[0], 10) ) {
                // There is a number but not a unit
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit:'',
                    ingredient: arrIng.slice(1).join(' ')
                }

            }   
            else if (unitIndex === -1){
                //There is no unit
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient: ingredient
                }
            }

            return objIng;

        })
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec' ? this.servings-1: this.servings+1;
    
        //Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });
        
        this.servings = newServings;
    }
}

