package main 

import (
	"os"
	"net/http"
	"log"
	"fmt"
	/*  _ It's for importing a package solely for its side-effects.
		In the case of go-sqlite3, the underscore import is used for the side-effect of registering 
	    the sqlite3 driver as a database driver in the init() function, without importing any other functions 
			sql.Register("sqlite3", &SQLiteDriver{})

		Once it's registered in this way, sqlite3 can be used with the standard library's 
		sql interface in your code like in the example:
			db, err := sql.Open("sqlite3", "./foo.db")
	*/
	_ "github.com/mattn/go-sqlite3"
	"github.com/gorilla/mux"
	"database/sql"
)

/* A Context carries a deadline, cancelation signal, and request-scoped values
// across API boundaries. Its methods are safe for simultaneous use by multiple
// goroutines.
type Context interface {
    // Done returns a channel that is closed when this Context is canceled
    // or times out.
    Done() <-chan struct{}

    // Err indicates why this context was canceled, after the Done channel
    // is closed.
    Err() error

    // Deadline returns the time when this Context will be canceled, if any.
    Deadline() (deadline time.Time, ok bool)

    // Value returns the value associated with key or nil if none.
    Value(key interface{}) interface{}
}
*.

// This function is of type http.HandlerFunc
/*
	type Handler interface {
	    ServeHTTP(ResponseWriter, *Request)
	}
*/
// Each http.Handler implementation can be thought of as its own web server.
func handlerItems(w http.ResponseWriter, r *http.Request){
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


func NewDB() *sql.DB {
    db, err := sql.Open("sqlite3", "./todo.db")
    checkErr(err)
    
    _, err = db.Exec("CREATE TABLE IF NOT EXISTS todoitems(title text, dueDate text, priority text, description text)")
    checkErr(err)

    return db
}

func AddItem(db *sql.DB) http.Handler{
	 return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	 	err := r.ParseForm()
		checkErr(err)

		todoName := r.PostFormValue("todo__name")
		todoDueDate := r.PostFormValue("todo__dueDate")
		todoPriority := r.PostFormValue("todo__priority")
		todoDescription := r.PostFormValue("todo__description")

	 	// Insert 
		stmt, err := db.Prepare("INSERT INTO todoitems (title, dueDate, priority, description) VALUES(?, ?, ?, ?)")
		checkErr(err)
		
		res, err := stmt.Exec(todoName, todoDueDate, todoPriority, todoDescription)
		checkErr(err)

		// LastInsertId returns the integer generated by the database
        // in response to a command. Typically this will be from an
        // "auto increment" column when inserting a new row. Not all
        // databases support this feature, and the syntax of such
        // statements varies.
        id, err := res.LastInsertId(); 
        checkErr(err)

        fmt.Println(id)
	 })
}

func ShowItems(db *sql.DB) {

}

func DeleteItem(db *sql.DB){

}

func checkErr(err error){
	if err != nil {
		/* Panic is a built-in function that stops the ordinary flow of control and begins panicking. 
		When the function F calls panic, execution of F stops, any deferred functions in F are executed normally, 
		and then F returns to its caller. To the caller, F then behaves like a call to panic. 
		The process continues up the stack until all functions in the current goroutine have returned, 
		at which point the program crashes.
		*/
        panic(err)
    }
}

func main(){
	port := os.Getenv("PORT") 

	if port == "" {
		port = "3000"
	}

	db := NewDB()

	//http.Handle("/", http.FileServer(http.Dir("./public")))

	r := mux.NewRouter()

	// Handle all requests to the web root w/ passed in function, handler
	r.Handle("/todoitems", AddItem(db))

	// This will serve files under http://localhost:3000/<filename> - Serves CSS, JS files 
	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("./public"))))

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

	http.ListenAndServe(":" + port, r)
}