const path = require("path")
const fs = require("fs")
const { time } = require("console")

// dirPath will help us navigate to our content/ dir where our
// markdown files (posts) are stored.
const dirPath = path.join(__dirname, "../src/content")
let postList = []

const dirPathPages = path.join(__dirname, "../src/pages/content")
let pageList = []

const getPosts = () => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return console.log(`Failed to list contents of directory: ${err}`)
        }

        // console.log(files)  // print a list of all files in this dir.
        files.forEach((file, idx) => {
            let obj = {}
            let post 
            fs.readFile(`${dirPath}/${file}`, "utf8", (err, contents) => {
                // console.log(contents) // print the contents of each file.
                
                // Format each file we read in as an array of strings where each
                // element is its own line in the MD file.
                const lines = contents.split("\n")
                const metadataIndices = lines.reduce((accumulator, currVal, idx) => {
                    // We pay special attention to the metadata we define on the first
                    // few lines where we have a `---` pattern.
                    if (/^---/.test(currVal)) {
                        accumulator.push(idx)
                    }

                    return accumulator
                }, [] /* initialValue */)

                const parseMetadata = ({lines, metadataIndices}) => {
                    if (metadataIndices.length > 0) {
                        // Grab the metadata for the MD file (first three lines).
                        let metadata = lines.slice(metadataIndices[0] + 1, metadataIndices[1])
                        metadata.forEach(line => {
                            const metadataLine = line.split(": ")
                            obj[metadataLine[0]] = metadataLine[1]
                        })
                        return obj
                    }
                }

                const parseContent = ({lines, metadataIndices}) => {
                    if (metadataIndices.length > 0) {
                        // Grab the contents as all the lines *after* our metadata headers.
                        lines = lines.slice(metadataIndices[1] + 1, lines.length)
                        return lines.join("\n")
                    }
                }
                
                // Initialize our Post fields.
                const metadata = parseMetadata({lines, metadataIndices})
                const content = parseContent({lines, metadataIndices})
                
                // Use the creation time as the ID to be unique and also to let us
                // sort posts by creation date.
                const date = new Date(metadata.date)
                const dateString = date.toString()
                const parsedDate = Date.parse(dateString)
                const timestamp = parsedDate / 1000

                post = {
                    id: timestamp,
                    title: metadata.title ? metadata.title : "Untitled",
                    author: metadata.author ? metadata.author : "Anonymous",
                    date: metadata.date ? metadata.date : "No date specified",
                    content: content ? content : "No content available",
                }

                // Add all posts to a single list of Posts.
                postList.push(post)

                // After we traverse thru all posts, stringify them and write to a file.
                if (idx === files.length - 1) {
                    // Sort posts by the ID.
                    const sortedList = postList.sort((a, b) => {
                        return a.id < b.id ? 1 : -1
                    })
                    let data = JSON.stringify(sortedList)
                    fs.writeFileSync("src/posts.json", data)
                }
            })
        })
    })
    // jank way to view this output, we dont programmically await but instead do it w/ timeout.
    // setTimeout(() => {
    //     console.log(postList)
    // }, 500)
    return postList
}

const getPages = () => {
    fs.readdir(dirPathPages, (err, files) => {
        if (err) {
            return console.log(`Failed to list contents of directory: ${err}`)
        }

        // console.log(files)  // print a list of all files in this dir.
        files.forEach((file, idx) => {
            let obj = {}
            let post 
            fs.readFile(`${dirPathPages}/${file}`, "utf8", (err, contents) => {
                page = {
                    content: contents
                }

                // Add all page contents to a single lists.
                pageList.push(page)

                // Stringify them and write to a file.
                let data = JSON.stringify(pageList)
                fs.writeFileSync("src/pages.json", data)
            })
        })
    })
    return postList
}

getPosts()
getPages()
