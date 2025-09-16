import React from "react";

const Search = ({searchTerm,setSearchTerm}) => {
    return(
        <div className="search">
<div>
    <img src="search.svg" alt="search"/>
<input 
type="text"
placeholder="Search through hundreds of trailers"
value={searchTerm}
onChange={(e)=>setSearchTerm(e.target.value)}
/>

</div>

        </div>
    )
}
export default Search;