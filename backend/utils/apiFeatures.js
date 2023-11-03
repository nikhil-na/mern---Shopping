class APIFeatures{
    constructor(query, queryStr){
        this.query = query,
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            // we are searching by name
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}

        console.log(keyword);
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryStrCopy = { ...this.queryStr };


        // console.log(queryCopy); 

        //  =>  /api/v1/products?keyword=..&category=..&limit=..&page=..          
        // We only want to work with category field here(so remove pagination, keyword field in this specific function)
        const removeFields = ['keyword', 'limit', 'page'];
        removeFields.forEach(el => delete queryStrCopy[el]);

        //Advanced filter for price, ratings etc (eg.price >= 1 & price <= 200)
        let queryStr = JSON.stringify(queryStrCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        //You don't need to make a copy of the query object because Mongoose query methods return new query objects, and the original query object remains unaltered.
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skipRes = resPerPage * (currentPage - 1);

        this.query = this.query.limit(resPerPage).skip(skipRes);
        return this;
    }
}

module.exports = APIFeatures;