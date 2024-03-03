const API = "https://api.github.com/users/";

const requestMaxTimeMs=3000;


const app= Vue.createApp({
    data() {
        return {
        search: null,
        result:null,
        error:null,
        favorites: new Map()
        }
    },
    created(){
        const savedFavorites = JSON.parse(window.localStorage.getItem('favorites'));
        if(savedFavorites?.length)
        {
            const favorites=new Map(savedFavorites.map(favorite => [favorite.login, favorite]));
            this.favorites= favorites;
            console.log(favorites);
        }
    },
    computed:{
        isFavorite(){
            return this.favorites.has(this.result.login);
        },
        allFavorites(){
            return Array.from(this.favorites.values())
        }
    },
    methods: {
        async doSearch(){
            this.result=this.error=null;

            const foundInFavorites= this.favorites.get(this.search);

            const shouldRequestAgain = (() => 
            {
                if(!!foundInFavorites)
                {
                    const {lastRequestTime}= foundInFavorites;
                    const now= Date.now();
                    return (now-lastRequestTime)>requestMaxTimeMs
                }
                return false;

            })()//IIFE

            if(!!foundInFavorites && !shouldRequestAgain)
            {
                console.log("Found and we use the cachet version");
                return this.result=foundInFavorites;
            }
            
            try{
                console.log("Not found or cache version too old");
                const response = await fetch(API + this.search)
                if(!response.ok)  throw new Error ("User not found")
                const data =await response.json(); 
                console.log(data);
                this.result=data;

                // Asegúrate de que foundInFavorites sea un objeto antes de intentar modificarlo
                if (foundInFavorites) {
                    foundInFavorites.lastRequestTime = Date.now();
                }
                
            }catch(error)
            {
                this.error=error;
            }finally{
                this.search=null;
            }
            
        } ,
        addFavorite()
        {
            this.result.lastRequestTime=Date.now();
            this.favorites.set(this.result.login, this.result)
            this.updateStorage();
        },
        removeFavorite()
        {
            this.favorites.delete(this.result.login);
            this.removeStorage(this.result.login);
        },
        showFavorite(favorite){
            this.result=favorite;
        },

        checkFavorite(id){
            return this.result?.login === id;
        },

        updateStorage() {
            window.localStorage.setItem('favorites', JSON.stringify(Array.from(this.favorites.values())));
        },

        removeStorage(login) {
            this.favorites.delete(login);
            this.updateStorage();
        },


    },
});



