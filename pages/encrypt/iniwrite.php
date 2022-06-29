<?php
function write_array_to_ini($array, $path) {
	// check first argument is array
	if (!is_array($array)) {
		throw new \InvalidArgumentException('Function argument 1 must be an array.');
	}

	// check second argument is string
	if (!is_string($path)) {
		throw new \InvalidArgumentException('Function argument 2 must be a string.');
	}

	# See if the array input is multidimensional.
	foreach($array AS $arrayTest){
		if(is_array($arrayTest)) {
			$arrayMulti = true;
		}
	}

	# Use categories in the INI file for multidimensional array OR use basic INI file:
	if ($arrayMulti) {
		$content = "";
		foreach ($array AS $key => $elem) {
			$content .= "[" . $key . "]\n";
			foreach ($elem AS $key2 => $elem2) {
				if (is_array($elem2)) {
					for ($i = 0; $i < count($elem2); $i++) {
						$content .= $key2 . "[]=" . $elem2[$i] . "\n";
					}
				} else if ($elem2 == "") {
					$content .= $key2 . "=\n";
				} else {
					$content .= $key2 . "=" . $elem2 . "\n";
				}
			}
		}
	} else {
		foreach ($array AS $key2 => $elem2) {
			if (is_array($elem2)) {
				for ($i = 0; $i < count($elem2); $i++) {
					$content .= $key2 . "[]=" . $elem2[$i] . "\n";
				}
			} else if ($elem2 == "") {
				$content .= $key2 . "=\n";
			} else {
				$content .= $key2 . "=" . $elem2 . "\n";
			}
		}
	}

	if (!$handle = fopen($path, "w")) {
		return false;
	}
	if (!fwrite($handle, $content)) {
		return false;
	}
	fclose($handle);
	return true;
}

function append_line_to_ini($filePath, $line) {
	// check first argument is array
	if (!is_string($filePath)) {
		throw new \InvalidArgumentException('Function argument 1 must be a string.');
	}

	// check second argument is string
	if (!is_string($line)) {
		throw new \InvalidArgumentException('Function argument 2 must be a string.');
	}

	file_put_contents($filePath, $line, FILE_APPEND | LOCK_EX);
}
?>