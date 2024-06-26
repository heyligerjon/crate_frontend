import { useCallback, useEffect, useState } from "react";
import { config } from "../../util/constants";
import { usePageMeta } from "../../util/util";

const URL = config.api_url

export default function Dig(props) {
	const [playlist, setPlaylist] = useState('')
	const [tracks, setTracks] = useState([])
	const [oEmbed, setOEmbed] = useState({})
	const [showLoad, setShowLoad] = useState(false)

    const title = "crate.digger";
    const description = "Enjoy a tailor-made selection of tunes perfect for any mood. Pick a genre or go with the flow!";
    usePageMeta(title, description);

	const logout = async () => {
		await fetch(`${URL}/logout/`)
	}

	const parseUrl = (url) => {
		// format: https%3A%2F%2Fopen.spotify.com%2Fepisode%2F7makk4oTQel546B0PZlDM5
		// ':' = %3A
		// '/' = %2F
		let params = url.replaceAll(':', '%3A');
		params = params.replaceAll('/', '%2F');
		return params;
	}
	
	const showLoadOnClick = useCallback(() => {
		setShowLoad(!showLoad)
	}, [showLoad])

	const getOembed = useCallback(async (params) => {
		await fetch(`https://open.spotify.com/oembed?url=${params}`)
		.then((response) => response.json())
		.then((result) => {
			if (result.error) {
			    console.log('Error:', result.error);
			    return false;
			}
			setOEmbed(result);
			if (!oEmbed) {
			    //show error if embed player isn't loaded	
			}
		})
	}, [oEmbed])

	// fetch data from backend
	const res = useEffect(() => {
		showLoadOnClick()
		fetch(`${URL}/recommendations/top/`)
		  .then((response) => {
			console.log(response.url)
			if (!response.ok) {
			if (response.status === 401 || response.status === 403) {
				console.error(response)
				window.location.replace('../');
			}
			else {
				console.error(response)
				//window.location.replace('../logout');
			}
			return {};
			}
			else {
			return response.json();
			}
		  })
		  .then((data) => {
			setPlaylist(data.playlist)
			setTracks(data.tracks)
		        getOembed(parseUrl(playlist))
		  })
		  .catch(error => {
			
		  })
	}, [playlist, showLoadOnClick, getOembed])

	return(
		<div className="container">
			<h1>&lt;Find your new favorites&gt;</h1>
			<button id="logout" onClick={logout}>Log Out</button>
			{/* on 1st dig, get 25, if not added, 
			on next dig remove and add new to 25, move to next in list
			on dig 25, move to crate, show button to dig again and make another

				todo: add dropdowns for genre, popularity?, mood, i'm feeling lucky
			<input placeholder="enter a genre"/> */}
			<button id="dig" href="" onClick={res}>&lt;dig&gt;</button>
			{ showLoad ?  <div id="progress-container">
			    <div id="messages">
				<pre id="progress-message">digging...</pre>
			    </div>
			    <progress id="progress-bar" value="0" max="100"></progress>
			</div> : null }
			{/* <div className="song-player"></div> */}
			{ !showLoad && tracks ? <div id="embed-iframe" className="playlist-player"></div> : null }
			<script src="https://open.spotify.com/embed/iframe-api/v1" async></script>
		</div>
	)
}
