package StreamApi;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FindUniqueElements {
	public static void main(String[] args) {
		List<Integer> list = Arrays.asList(1, 2, 2, 3, 4, 4);

		List<Integer> co = (List<Integer>) list.stream()
				.collect(Collectors.groupingBy(Function.identity(), Collectors.counting())).entrySet().stream().filter(entry->entry.getValue()==1).map(Map.Entry::getKey)
.toList()
		;
		System.out.println(co);
	}
}
