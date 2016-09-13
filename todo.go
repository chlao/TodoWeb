package main 

import (
	//"os"
	"net/http"
)

// This function is of type http.HandlerFunc
/*
	type Handler interface {
	    ServeHTTP(ResponseWriter, *Request)
	}
*/
// Each http.Handler implementation can be thought of as its own web server.
func handler(w http.ResponseWriter, r *http.Request){
	// http.ResponseWriter assembles the HTTP's server response
	// By writing to it, we send data to the HTTP client
	/*
		type ResponseWriter interface {
		    Header() Header
		    Write([]byte) (int, error)
		    WriteHeader(int)
		}
	*/

	// http.Request is a data structure that represents the client HTTP request 
	// r.URL.path is the path component of the request URL
}

func main(){
	//port := os.Getenv("PORT")

	// Handle all requests to the web root w/ passed in function, handler
	// http.HandleFunc("/", handler)

	http.Handle("/", http.FileServer(http.Dir("./static")))
	//":" + port
	// Used to start the server 
	// When it receives an HTTP request, it will hand it off to the http.Handler that we supply as the second argument

	/* 
		The http.FileServer function builds an http.Handler that will serve an entire directory of files 
		and figure out which file to serve based on the request path. 
	*/
	// We told the FileServer to serve the current working directory with http.Dir(".").
	// nil -> use DefaultServeMux (default HTTP request router)
	/* 
		ServeMux: Compares incoming requests against a list of predefined URL paths, and 
		calls the associated handler for the path whenever a match is found.
	*/
	/*
		type ServeMux struct {
		    mu sync.RWMutex   // because of concurrency, we have to use a mutex here
		    m  map[string]muxEntry  // router rules, every string mapping to a handler
		}
	*/
	// Handle and HandleFunc add handlers to DefaultServeMuxs
	// Handlers are responsible for writing response headers and bodies.
	log.Println("Listening...")
	http.ListenAndServe(":3000", nil)
}