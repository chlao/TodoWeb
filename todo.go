package main 

import (
	"os"
	"net/http"
	"log"
	"fmt"
	//"github.com/mattn/go-sqlite3"
	//"database/sql"
	"strings"
	//"github.com/gorilla/mux"
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


	err := r.ParseForm()

	checkErr(err)

    log.Println(r.Form)

    for k, v := range r.PostForm {
        fmt.Println("key:", k)
        fmt.Println("val:", strings.Join(v, ""))
    }

    /*
	todoName := r.PostFormValue("todo__name")
	todoDueDate := r.PostFormValue("todo__dueDate")
	todoPriority := r.PostFormValue("todo__priority")
	todoDescription := r.PostFormValue("todo__description")

	fmt.Println(todoName)
	fmt.Println(todoDueDate)
	fmt.Println(todoPriority)
	fmt.Println(todoDescription)

	log.Println(r.Method)
	*/
	//w.Write([]byte(fmt.Sprintf("r.Form: %#v\nr.PostForm: %#v.\n", r.Form, r.PostForm)))
	//fmt.Fprintf(w, "hi" + todoName + todoDueDate + todoPriority + todoDescription)
}

/*
func NewDB() *sql.DB {
    db, err := sql.Open("sqlite3", "./todo.db")
    checkErr(err)
    
    _, err = db.Exec("create table if not exists todoitems(title text, dueDate text, todoPriority text, todoDescription text)")
    checkErr(err)

    return db
}

func showItems(db *sql.DB) {

}*/

func checkErr(err error){
	if err != nil {
        fmt.Println(err)
        return
    }
}

func main(){
	port := os.Getenv("PORT") 

	if port == "" {
		port = "3000"
	}

	//db := NewDB()

	

	// Handle all requests to the web root w/ passed in function, handler
	http.HandleFunc("/todoitems", handler)

	http.Handle("/", http.FileServer(http.Dir("./public")))

	//r := mux.NewRouter()
	// This will serve files under http://localhost:3000/<filename> - Serves CSS, JS files 
	//r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./public"))))

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
	http.ListenAndServe(":" + port, nil)
}