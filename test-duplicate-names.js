// Test para verificar nombres descriptivos de Pokémon duplicados
// Ejecutar en la consola del navegador

async function testDuplicateNames() {
  console.log('🧪 Testing duplicate name resolution...');
  
  try {
    // Simular algunos casos de prueba
    const mockPokemon = [
      {
        pokemon_id: 1,
        pokemon_name: 'Bulbasaur',
        form: 'Normal',
        base_attack: 118,
        base_defense: 111,
        base_stamina: 128
      },
      {
        pokemon_id: 10001,
        pokemon_name: 'Shadow Bulbasaur',
        form: 'Normal',
        base_attack: 142, // 20% más ataque
        base_defense: 89,  // 20% menos defensa
        base_stamina: 128
      },
      {
        pokemon_id: 19,
        pokemon_name: 'Rattata',
        form: 'Alolan',
        base_attack: 103,
        base_defense: 70,
        base_stamina: 102
      },
      {
        pokemon_id: 150,
        pokemon_name: 'Mewtwo',
        form: 'Normal',
        base_attack: 300,
        base_defense: 182,
        base_stamina: 214
      },
      {
        pokemon_id: 10150,
        pokemon_name: 'Mega Mewtwo X',
        form: 'Mega X',
        base_attack: 330,
        base_defense: 200,
        base_stamina: 214
      }
    ];
    
    // Test generateDisplayName method
    console.log('\n📝 Testing generateDisplayName:');
    mockPokemon.forEach(pokemon => {
      // Simular el método generateDisplayName
      let name = pokemon.pokemon_name;
      const descriptors = [];

      // Detectar Shadow Pokémon
      if (name.toLowerCase().includes('shadow')) {
        descriptors.push('Sombra');
        name = name.replace(/shadow\s*/gi, '').trim();
      }

      // Detectar Mega evoluciones
      if (name.toLowerCase().includes('mega')) {
        if (name.toLowerCase().includes('mega x')) {
          descriptors.push('Mega X');
          name = name.replace(/mega\s*x\s*/gi, '').trim();
        } else if (name.toLowerCase().includes('mega y')) {
          descriptors.push('Mega Y');
          name = name.replace(/mega\s*y\s*/gi, '').trim();
        } else {
          descriptors.push('Mega');
          name = name.replace(/mega\s*/gi, '').trim();
        }
      }

      // Detectar formas regionales
      if (pokemon.form && pokemon.form.toLowerCase() !== 'normal') {
        const form = pokemon.form.toLowerCase();
        if (form.includes('alola')) {
          descriptors.push('Alola');
        } else if (form.includes('galar')) {
          descriptors.push('Galar');
        } else if (form.includes('mega')) {
          // Ya manejado arriba
        } else {
          descriptors.push(pokemon.form);
        }
      }

      // Construir nombre final
      const finalName = descriptors.length > 0 ? `${name} - ${descriptors.join(', ')}` : name;
      
      console.log(`  ${pokemon.pokemon_name} → ${finalName}`);
    });
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Ejecutar el test
testDuplicateNames();
