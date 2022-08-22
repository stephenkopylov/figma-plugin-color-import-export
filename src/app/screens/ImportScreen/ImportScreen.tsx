import React, { useState, useMemo } from 'react';

import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/joy/Button';
import Color from 'color';
import { FigmaMessage, ImportColorsMessage, MessageTypes } from 'declarations/messages';
import { PLUGIN_ID } from 'declarations/plugin';
import { ImportColor } from 'declarations/colors';
import { Paint as PaintComponent, solidPaintToColor } from 'app/components/Paint';

const exampleInput = {
  MY_EXAMPLE_COLOR: 'rgba(0, 0, 0, .75)',
};

export function ImportScreen() {
  const [input, setInput] = useState<string>(JSON.stringify(exampleInput, null, 2));

  const importColors: ImportColor[] = useMemo(() => {
    let ret: ImportColor[] = [];

    try {
      const inputObject = JSON.parse(input);

      for (const [k, v] of Object.entries(inputObject)) {
        if (typeof v === 'string') {
          try {
            const color = Color(v);

            ret.push({
              name: k,
              r: color.red(),
              g: color.green(),
              b: color.blue(),
              a: color.alpha(),
            });
          } catch (e) {
            // do nothing
          }
        }
      }
    } catch (e) {
      return [];
    }

    return ret;
  }, [input]);

  return (
    <Box width="100%" height="100%">
      <Box sx={{ marginBottom: 2 }}>
        <Typography level="body1" component="h1" fontWeight="bold" fontSize="12px" marginBottom="2">
          Input Colors
        </Typography>

        <TextField
          fullWidth
          InputProps={{
            sx: {
              fontFamily: 'monospace',
              fontSize: 12,
            },
          }}
          placeholder="Paste color JSON here"
          rows={5}
          multiline
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </Box>

      <Box sx={{ marginBottom: 2 }}>
        <Button
          disabled={importColors.length === 0}
          fullWidth
          onClick={() => {
            const message: FigmaMessage<ImportColorsMessage> = {
              pluginId: PLUGIN_ID,
              pluginMessage: {
                type: MessageTypes.IMPORT_COLORS,
                colors: importColors,
              },
            };

            parent.postMessage(message, 'https://www.figma.com');
          }}
        >
          Import
        </Button>
      </Box>

      {importColors?.length > 0 && (
        <Box sx={{ marginBottom: 2 }}>
          <Typography level="body1" component="h1" fontWeight="bold" fontSize="12px" marginBottom="2">
            Import Preview
          </Typography>

          <Box display="grid" gridTemplateColumns="repeat(auto-fill, 25px)" gap="5px">
            {importColors.map((color, i) => {
              return (
                <PaintComponent
                  key={i}
                  paint={{
                    type: 'SOLID',
                    color: {
                      r: color.r,
                      g: color.g,
                      b: color.b,
                    },
                    opacity: color.a,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}